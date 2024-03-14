import os
import glob
import unreal
import tkinter as tk
from tkinter import filedialog

import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

menus = unreal.ToolMenus.get()
main_menu = menus.find_menu("LevelEditor.MainMenu")
custom_menu = main_menu.add_sub_menu("CustomMenu", "Custom Menu", "Menu name", "SwitchLight Studio")

# Define the base path to your textures and the Unreal asset path
AssetTools = unreal.AssetToolsHelpers.get_asset_tools()
EditorAssetLibrary = unreal.EditorAssetLibrary

# Define the naming convention for your PBR maps
texture_bases = ["albedo", "normal", "roughness", "specular"]
texture_types = {
        "Albedo": "albedo/*",
        "Normal": "normal/*",
        "Roughness": "roughness/*",
        "Specular": "specular/*",
}

for name in ["Import PBR Maps"]:
    e = unreal.ToolMenuEntry(
        name = name,
        type = unreal.MultiBlockType.MENU_ENTRY,
    )
    e.set_label(name)
    if name == "Import PBR Maps":
        e.set_string_command(
            unreal.ToolMenuStringCommandType.PYTHON,
            custom_type=unreal.Name(''),
            string="import pbr_loader_ue; pbr_loader_ue.run();")

    custom_menu.add_menu_entry("Items", e)

history = custom_menu.add_sub_menu(
                owner=custom_menu.menu_name,
                section_name='RecentPBRMaps',
                name='Recent PBR Maps',
                label='Recent PBR Maps'
            )

# refresh the editor to reflect the changes
menus.refresh_all_widgets()


# Define the base path to your textures and the Unreal asset path
def generate_unique_asset_path(base_path):
    """
    Generates a unique asset path by appending a number to the base path.
    """
    number = 0
    unique_path = f"{base_path}_{number:04d}"
    while unreal.EditorAssetLibrary.does_directory_exist(unique_path):
        number += 1
        unique_path = f"{base_path}_{number:04d}"
    return unique_path, f"{number:04d}"

def get_dimensions(asset_path, file_path):

    task = unreal.AssetImportTask()
    task.filename = file_path
    task.destination_path = asset_path
    task.save = True
    task.replace_existing = True

    unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])

    if task.imported_object_paths:
        # rename asset
        unreal.EditorAssetLibrary.rename_asset(task.imported_object_paths[0], f"{asset_path}/HelperTexture")
        imported_asset = unreal.load_asset(f"{asset_path}/HelperTexture")
        print(f"Successfully imported {imported_asset.get_name()} at {imported_asset.get_path_name()}")

    else:
        print(f"Failed to import {file_path}")
        return None

    if imported_asset:
        # Cast to Texture2D to get dimensions
        texture_asset = unreal.Texture2D.cast(imported_asset)
        if texture_asset:
            width = texture_asset.blueprint_get_size_x()
            height = texture_asset.blueprint_get_size_y()
            unreal.log("Width:" + str(width) + " Height:" + str(height))
        else:
            unreal.log("Imported asset is not a Texture2D.")
    else:
        unreal.log("Failed to import the asset.")

    return width, height


def add_history(directory):
    # Add a menu item to history
    menu_entry = unreal.ToolMenuEntry(type=unreal.MultiBlockType.MENU_ENTRY)
    menu_entry.set_label(directory)
    history.add_menu_entry('Recent PBR Maps', menu_entry)
    unreal.log("Added to history: " + directory)

def run():
    root = tk.Tk()
    root.withdraw()
    directory_path = filedialog.askdirectory(title="Select PBR Map Directory")
    root.destroy()
    if directory_path:
        unreal.log("Selected Directory: " + directory_path)
        asset_path, asset_index = generate_unique_asset_path( "/Game/Movies/SwitchLight")

        unreal.log("================= Asset Path: " + asset_path)
        camera_actor, camera_aspect_ratio = create_camera_actor(asset_index)
        is_png, num_frames, width, height = load_media_source(asset_path, source_directory=directory_path)
        create_media_texture_and_player(asset_path, is_png)
        create_material_graph(asset_path, is_png)
        create_plane(asset_path, asset_index, camera_aspect_ratio, height, width)
        create_level_sequence(asset_path, camera_actor, num_frames)
        add_history(directory_path)

def create_camera_actor(asset_index):
    # Create a camera actor
    camera_actor = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.CineCameraActor, location=unreal.Vector(0, 0, 100), rotation=unreal.Rotator(0, 0, 0))
    if camera_actor:
        camera_actor.set_actor_label('SwitchLight Camera ' + asset_index)
        camera_component = camera_actor.get_cine_camera_component()

        camera_aspect_ratio = camera_component.get_editor_property("filmback").get_editor_property("sensor_aspect_ratio")

        if camera_component:
            camera_component.set_field_of_view(90.0)
            unreal.log("Camera actor spawned successfully.")
        else:
            unreal.log_error("Failed to get camera component.")
    else:
        unreal.log_error("Failed to spawn camera actor.")

    return camera_actor, camera_aspect_ratio


def create_plane(asset_path, asset_index, camera_aspect_ratio=16/9, height=1.0, width=1.0):
    # camera horizontal fov is always 90
    # since plane width and height are 100, distance from camera to plane should be 50
    mesh_actor = unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.StaticMeshActor, location=unreal.Vector(50, 0, 100), rotation=unreal.Rotator(90, 0, 90))
    mesh_aspect_ratio = width / height
    if mesh_actor:
        mesh_actor.set_actor_label('SwitchLight Plane ' + asset_index)
        mesh_component = mesh_actor.get_component_by_class(unreal.StaticMeshComponent.static_class())
        if mesh_component:
            mesh_component.set_static_mesh(unreal.load_asset("/Engine/BasicShapes/Plane"))
            mesh_component.set_material(0, unreal.load_asset(f"{asset_path}/PBR_Material"))
            mesh_component.set_mobility(unreal.ComponentMobility.MOVABLE)
            if mesh_aspect_ratio > camera_aspect_ratio:
                mesh_actor.set_actor_scale3d(unreal.Vector(1, 1/mesh_aspect_ratio, 1))
            else:
                mesh_actor.set_actor_scale3d(unreal.Vector(mesh_aspect_ratio/camera_aspect_ratio, 1/camera_aspect_ratio, 1))
            unreal.log("Plane actor spawned successfully.")
        else:
            unreal.log_error("Failed to get mesh component.")

    return mesh_actor

def create_custom_linear_to_srgb(material, texture_node, y_position, texture_type):

    # Create constant nodes
    const_0_003131 = unreal.MaterialEditingLibrary.create_material_expression(material, unreal.MaterialExpressionConstant, -450, y_position-100)
    const_0_003131.r = 0.003131

    # Create a Power node (texture ^ 2.2)
    power_node = unreal.MaterialEditingLibrary.create_material_expression(material, unreal.MaterialExpressionPower, -1000, y_position)
    if texture_type == "normal":
        unreal.MaterialEditingLibrary.connect_material_expressions(texture_node, '', power_node, 'Base')
    else:
        unreal.MaterialEditingLibrary.connect_material_expressions(texture_node, 'RGB', power_node, 'Base')
    unreal.MaterialEditingLibrary.connect_material_expressions(texture_node, '', power_node, 'Base')
    power_node.set_editor_property('const_exponent', 0.4167)

    # Create a Multiply node (power * 1.055)
    multiply_node_1 = unreal.MaterialEditingLibrary.create_material_expression(material, unreal.MaterialExpressionMultiply, -850, y_position)
    unreal.MaterialEditingLibrary.connect_material_expressions(power_node, '', multiply_node_1, 'A')
    multiply_node_1.set_editor_property('const_b', 1.055)

    # Create an Add node (multiply - 0.055)
    add_node = unreal.MaterialEditingLibrary.create_material_expression(material, unreal.MaterialExpressionAdd, -700, y_position)
    unreal.MaterialEditingLibrary.connect_material_expressions(multiply_node_1, '', add_node, 'A')
    add_node.set_editor_property('const_b', -0.055)

    # Create a Multiply node for linear scaling (texture * 12.92)
    multiply_node_2 = unreal.MaterialEditingLibrary.create_material_expression(material, unreal.MaterialExpressionMultiply, -550, y_position)
    if texture_type == "normal":
        unreal.MaterialEditingLibrary.connect_material_expressions(texture_node, '', multiply_node_2, 'A')
    else:
        unreal.MaterialEditingLibrary.connect_material_expressions(texture_node, 'RGB', multiply_node_2, 'A')
    multiply_node_2.set_editor_property('const_b', 12.92)

    # Create a comparison (if) node to check if the texture is less than 0.0031308
    if_node = unreal.MaterialEditingLibrary.create_material_expression(material, unreal.MaterialExpressionIf, -400, y_position)
    if texture_type == "normal":
        unreal.MaterialEditingLibrary.connect_material_expressions(texture_node, '', if_node, 'A')
    else:
        unreal.MaterialEditingLibrary.connect_material_expressions(texture_node, 'RGB', if_node, 'A')
    unreal.MaterialEditingLibrary.connect_material_expressions(const_0_003131, '', if_node, 'B')
    unreal.MaterialEditingLibrary.connect_material_expressions(add_node, '', if_node, 'A > B')
    unreal.MaterialEditingLibrary.connect_material_expressions(multiply_node_2, '', if_node, 'A == B')
    unreal.MaterialEditingLibrary.connect_material_expressions(multiply_node_2, '', if_node, 'A < B')

    return if_node



def create_channel_splitter(material, texture_node, r=False, g=False, b=False, position_offset=(200, 0)):

    mask_node = unreal.MaterialEditingLibrary.create_material_expression(material, unreal.MaterialExpressionComponentMask, texture_node.material_expression_editor_x + position_offset[0], texture_node.material_expression_editor_y + position_offset[1])
    mask_node.set_editor_property('r', r)
    mask_node.set_editor_property('g', g)
    mask_node.set_editor_property('b', b)
    mask_node.set_editor_property('a', False)

    # Connect the texture node to the mask node
    unreal.MaterialEditingLibrary.connect_material_expressions(texture_node, '', mask_node, '')

    return mask_node


def create_material_graph(asset_path, is_png=False):
    ''' Create PBR material '''
    # Check if the base material already exists
    material_asset_path = f"{asset_path}/PBR_Material"
    if not EditorAssetLibrary.does_asset_exist(material_asset_path):
        # Create a new material asset if it does not exist
        material_factory = unreal.MaterialFactoryNew()
        mat_closure = AssetTools.create_asset("PBR_Material", asset_path, unreal.Material, material_factory)
        # Set the blend mode to alpha composite
        if not mat_closure:
            raise Exception("Failed to create material.")
        mat_closure.set_editor_property("blend_mode", unreal.BlendMode.BLEND_TRANSLUCENT)

    # Set translucency lighting mode to surface per pixel lighting
    mat_closure.set_editor_property("translucency_lighting_mode", unreal.TranslucencyLightingMode.TLM_SURFACE_PER_PIXEL_LIGHTING)

    # Make a texture diffuse node.
    ts_node_diffuse = unreal.MaterialEditingLibrary.create_material_expression(mat_closure, unreal.MaterialExpressionTextureSample,-1500,-500)
    albedo_texture_asset_path = f"{asset_path}/AlbedoTexture"
    albedo_texture_asset = unreal.EditorAssetLibrary.find_asset_data( albedo_texture_asset_path ).get_asset()
    ts_node_diffuse.texture = albedo_texture_asset
    ts_node_diffuse.set_editor_property('desc', 'Albedo Texture Sampler')
    if not is_png:
        ts_node_diffuse.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_COLOR)
    ## Connect the texture node to the material base color
    unreal.MaterialEditingLibrary.connect_material_property(ts_node_diffuse, "RGB", unreal.MaterialProperty.MP_BASE_COLOR)
    unreal.MaterialEditingLibrary.connect_material_property(ts_node_diffuse, "A", unreal.MaterialProperty.MP_OPACITY)

    # Make a texture normal node.
    ts_node_normal = unreal.MaterialEditingLibrary.create_material_expression(mat_closure,unreal.MaterialExpressionTextureSample,-1500,0)
    normal_texture_asset_path = f"{asset_path}/NormalTexture"
    normal_texture_asset = unreal.EditorAssetLibrary.find_asset_data( normal_texture_asset_path ).get_asset()
    ts_node_normal.texture = normal_texture_asset
    unreal.MaterialEditingLibrary.connect_material_property(ts_node_normal, "", unreal.MaterialProperty.MP_NORMAL)
    ts_node_normal.set_editor_property('desc', 'Normal Texture Sampler')
    if not is_png:
        ts_node_normal.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_COLOR)

    # Linear to sRGB if needed
    ts_node_normal_linear = create_custom_linear_to_srgb(mat_closure, ts_node_normal, 0, "normal") if is_png else ts_node_normal

    # 2 * normal - 1
    multiply_node_3 = unreal.MaterialEditingLibrary.create_material_expression(mat_closure, unreal.MaterialExpressionMultiply, -1300, 200)
    unreal.MaterialEditingLibrary.connect_material_expressions(ts_node_normal_linear, '', multiply_node_3, 'A')
    multiply_node_3.set_editor_property('const_b', 2.0)
    subtract_node = unreal.MaterialEditingLibrary.create_material_expression(mat_closure, unreal.MaterialExpressionSubtract, -1150, 200)
    unreal.MaterialEditingLibrary.connect_material_expressions(multiply_node_3, '', subtract_node, 'A')
    subtract_node.set_editor_property('const_b', 1.0)

    ## Split the normal texture into separate channels
    ts_node_normal_r = create_channel_splitter(mat_closure,subtract_node, r=True, position_offset=(200, -100))
    ts_node_normal_g = create_channel_splitter(mat_closure,subtract_node, g=True, position_offset=(200, 0))
    ts_node_normal_b = create_channel_splitter(mat_closure,subtract_node, b=True, position_offset=(200, 100))

    # mutiply by -1
    multiply_node = unreal.MaterialEditingLibrary.create_material_expression(mat_closure, unreal.MaterialExpressionMultiply, ts_node_normal_g.material_expression_editor_x + 150, ts_node_normal_g.material_expression_editor_y)
    multiply_node.set_editor_property('const_b', -1.0)
    unreal.MaterialEditingLibrary.connect_material_expressions(ts_node_normal_g, '', multiply_node, 'A')

    # append
    append_node = unreal.MaterialEditingLibrary.create_material_expression(mat_closure, unreal.MaterialExpressionAppendVector, multiply_node.material_expression_editor_x + 150, multiply_node.material_expression_editor_y)
    unreal.MaterialEditingLibrary.connect_material_expressions(ts_node_normal_r, '', append_node, 'A')
    unreal.MaterialEditingLibrary.connect_material_expressions(multiply_node, '', append_node, 'B')
    append_node_2 = unreal.MaterialEditingLibrary.create_material_expression(mat_closure, unreal.MaterialExpressionAppendVector, append_node.material_expression_editor_x + 150, append_node.material_expression_editor_y)
    unreal.MaterialEditingLibrary.connect_material_expressions(append_node, '', append_node_2, 'A')
    unreal.MaterialEditingLibrary.connect_material_expressions(ts_node_normal_b, '', append_node_2, 'B')
    unreal.MaterialEditingLibrary.connect_material_property(append_node_2, "", unreal.MaterialProperty.MP_NORMAL)

    # Make a texture roughness node.
    ts_node_roughness = unreal.MaterialEditingLibrary.create_material_expression(mat_closure,unreal.MaterialExpressionTextureSample,-1500,500)
    roughness_texture_asset_path = f"{asset_path}/RoughnessTexture"
    roughness_texture_asset = unreal.EditorAssetLibrary.find_asset_data( roughness_texture_asset_path ).get_asset()
    ts_node_roughness.texture = roughness_texture_asset
    ts_node_roughness.set_editor_property('desc', 'Roughness Texture Sampler')
    if not is_png:
        ts_node_roughness.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_COLOR)

    # Linear to sRGB if needed
    ts_node_roughness_linear = create_custom_linear_to_srgb(mat_closure, ts_node_roughness, 500, "roughness") if is_png else ts_node_roughness
    unreal.MaterialEditingLibrary.connect_material_property(ts_node_roughness_linear, "", unreal.MaterialProperty.MP_ROUGHNESS)

    # Make a texture specular node.
    ts_node_specular = unreal.MaterialEditingLibrary.create_material_expression(mat_closure,unreal.MaterialExpressionTextureSample,-1500,1000)
    specular_texture_asset_path = f"{asset_path}/SpecularTexture"
    specular_texture_asset = unreal.EditorAssetLibrary.find_asset_data( specular_texture_asset_path ).get_asset()
    ts_node_specular.texture = specular_texture_asset
    ts_node_specular.set_editor_property('desc', 'Specular Texture Sampler')
    if not is_png:
        ts_node_specular.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_COLOR)

    # Linear to sRGB if needed
    ts_node_specular_linear = create_custom_linear_to_srgb(mat_closure, ts_node_specular, 1000, "specular") if is_png else ts_node_specular
    unreal.MaterialEditingLibrary.connect_material_property(ts_node_specular_linear, "", unreal.MaterialProperty.MP_SPECULAR)

    unreal.MaterialEditingLibrary.recompile_material(mat_closure)


def load_media_source(asset_path, source_directory):
    ''' Load media source '''
    image_media_factory = unreal.ImgMediaSourceFactoryNew()

    is_png_list = []
    for texture_type, sequence_path in texture_types.items():
        # Create the Image Media Source asset
        media_source = unreal.AssetToolsHelpers.get_asset_tools().create_asset(
            f"{texture_type}Source", asset_path, unreal.ImgMediaSource, image_media_factory
        )

        sequence_path_pattern = os.path.join(source_directory, sequence_path)

        # Get all the files in the directory
        source_paths = glob.glob(sequence_path_pattern)

        # extension check
        for source_path in source_paths:
            _, ext = os.path.splitext(source_path.lower())
            if ext == ".png":
                is_png_list.append(True)
            if ext == ".exr":
                is_png_list.append(False)

        # check if all textures have same extension
        if sum(is_png_list) == len(is_png_list) or sum(is_png_list) == 0:
            media_source.set_sequence_path(sequence_path_pattern)
            unreal.log(f"{texture_type} Media Source created successfully.")
        else:
            unreal.log_error("All textures must be either png or exr")

    # get dimensions
    width, height = get_dimensions(asset_path, source_paths[0])

    unreal.log("is_png_list: " + str(len(is_png_list)))

    is_png = True if sum(is_png_list) == len(is_png_list) else False

    return is_png, len(is_png_list) / len(texture_types), width, height

def create_media_texture_and_player(asset_path, is_png=True):

    # Create a Media Texture asset
    media_texture_factory = unreal.MediaTextureFactoryNew()
    media_player_factory = unreal.MediaPlayerFactoryNew()

    for texture_type in texture_types.keys():
        # Create the Media Texture asset
        media_texture_asset = AssetTools.create_asset(
            f"{texture_type}Texture", asset_path, unreal.MediaTexture, media_texture_factory
        )

        if not is_png:
            media_texture_asset.set_editor_property("srgb", False)

        # Create the Media Texture asset
        media_player_asset = AssetTools.create_asset(
            f"{texture_type}Player", asset_path, unreal.MediaPlayer, media_player_factory
        )
        media_source = unreal.EditorAssetLibrary.find_asset_data( f"{asset_path}/{texture_type}Source" ).get_asset()
        # Set playlist
        media_playlist = unreal.MediaPlaylist()
        media_playlist.add(media_source)
        media_player_asset.set_editor_property("playlist", media_playlist)
        media_texture_asset.set_editor_property("media_player", media_player_asset)

    unreal.log("Media Texture and Player created successfully.")


def create_level_sequence(asset_path, camera_actor, num_frames=1000):

    unreal.log("Creating Level Sequence... " + str(num_frames) + " frames")
    # Create a Level Sequence asset
    level_sequence_factory = unreal.LevelSequenceFactoryNew()
    level_sequence = AssetTools.create_asset(
        "PBRSequencer", asset_path, unreal.LevelSequence, level_sequence_factory
    )
    level_sequence.set_playback_start(0)
    level_sequence.set_playback_end(num_frames)

    binding = level_sequence.add_possessable(camera_actor)
    binding_id = level_sequence.get_binding_id(binding)

    # Create a Camera Cut Track
    camera_cut_track = level_sequence.add_master_track(unreal.MovieSceneCameraCutTrack)
    camera_cut_section = camera_cut_track.add_section()
    camera_cut_section.set_camera_binding_id(binding_id)
    camera_cut_section.set_range(0.0, num_frames) # Start and end frames

    for texture_type in texture_types.keys():
        media_track = level_sequence.add_track(unreal.MovieSceneMediaTrack)
        media_track.set_display_name(texture_type)
        media_section = media_track.add_section()
        media_section.set_range(0.0, num_frames) # Start and end frames
        media_source = unreal.EditorAssetLibrary.find_asset_data( f"{asset_path}/{texture_type}Source" ).get_asset()
        media_texture = unreal.EditorAssetLibrary.find_asset_data( f"{asset_path}/{texture_type}Texture" ).get_asset()
        media_section.set_editor_property("media_source", media_source)
        media_section.set_editor_property("media_texture", media_texture)








