bl_info = {
    "name": "SwitchLight Studio",
    "author": "Beeble Inc.",
    'description': 'SwitchLight Studio Plugin for Blender',
    'version': (0, 1, 2),
    'blender': (2, 80, 0),
    'location': '3D View',
    'warning': '',
    "category": "3D View",
}

import os
import math
import json
import glob
import subprocess

import bpy
import mathutils

from bpy.props import StringProperty, BoolProperty
from bpy.types import Operator, Panel

from bpy_extras.io_utils import ImportHelper
from bpy_extras.io_utils import axis_conversion

DISTANCE_FROM_CAMERA = 1

UNITY2BLENDER = axis_conversion(from_forward='Z', from_up='Y', to_forward='-Y', to_up='Z').to_4x4()

IDENTITY_MATRIX = mathutils.Matrix.Identity(4)

ORIENTATION_PORTRAIT = 1
ORIENTATION_UPSIDE_DOWN = 2
ORIENTATION_LANDSCAPE_LEFT = 3
ORIENTATION_LANDSCAPE_RIGHT = 4

RAD_PORTRAIT = math.radians(0)
RAD_LANDSCAPE_LEFT = math.radians(0)
RAD_LANDSCAPE_RIGHT = math.radians(180)

ROTATE_PORTRAIT = mathutils.Matrix.Rotation(RAD_PORTRAIT, 4, 'Z')
ROTATE_LANDSCAPE_LEFT = mathutils.Matrix.Rotation(RAD_LANDSCAPE_LEFT, 4, 'Z')
ROTATE_LANDSCAPE_RIGHT = mathutils.Matrix.Rotation(RAD_LANDSCAPE_RIGHT, 4, 'Z')


def create_material(plane_obj, map_paths, frame_start, frame_end):
    # Create a new material
    mat = bpy.data.materials.new(name="GeneratedMaterial")
    mat.use_nodes = True

    for node in mat.node_tree.nodes:
        mat.node_tree.nodes.remove(node)

    # Create Full BSDF Node and Frame
    bsdf_node = mat.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf_node.name = "FullBSDF"
    bsdf_node.location = (-500, -100)

    frames = {}

    # For each map type and its path
    for map_type, sequence_paths in map_paths.items():
        # Create a frame for each map type
        frame = mat.node_tree.nodes.new('NodeFrame')
        frame.label = map_type + " Frame"
        frames[map_type] = frame

        index = list(map_paths.keys()).index(map_type)

        # Create a new image texture node
        tex_node = mat.node_tree.nodes.new('ShaderNodeTexImage')
        tex_node.parent = frame
        tex_node.location = (-1100, -300 * index)  # Example positioning
        # Load image or image sequence based on the number of paths
        if len(sequence_paths) == 1:  # If only one image, load it directly
            img = bpy.data.images.load(sequence_paths[0])
            # exr handle
            if map_type == "Albedo" and sequence_paths[0].lower().endswith(".exr"):
                img.colorspace_settings.name = 'Non-Color'
            if map_type in ['Normal', 'Roughness', 'Specular']:
                img.colorspace_settings.name = 'Non-Color'
            tex_node.image = img
        else:  # If multiple images, load them as a sequence
            tex_node.image_user.frame_start = frame_start
            tex_node.image_user.frame_duration = frame_end - frame_start
            tex_node.image_user.frame_offset = 0
            tex_node.image_user.use_auto_refresh = True

            # Load image sequence
            for i, path in enumerate(sequence_paths):
                img = bpy.data.images.load(path)
                img.source = 'SEQUENCE'
                # exr handle
                if map_type == "Albedo" and path.lower().endswith(".exr"):
                    img.colorspace_settings.name = 'Non-Color'
                if map_type in ['Normal', 'Roughness', 'Specular']:
                    img.colorspace_settings.name = 'Non-Color'
                tex_node.image = img

        # Depending on the map type, connect the image texture node to the appropriate input of the Principled BSDF
        if map_type == 'Albedo':
            # Full Render
            vec_mult_node1 = mat.node_tree.nodes.new('ShaderNodeVectorMath')
            vec_mult_node1.operation = 'MULTIPLY'
            vec_mult_node1.inputs[1].default_value = (1.0, 1.0, 1.0)
            vec_mult_node1.parent = frame
            vec_mult_node1.location = (-800, -300 * index - 200)  # Example positioning
            # Link the color output of the texture to the vector math nodes
            mat.node_tree.links.new(vec_mult_node1.inputs[0], tex_node.outputs['Color'])
            mat.node_tree.links.new(bsdf_node.inputs['Base Color'], vec_mult_node1.outputs[0])
            mat.node_tree.links.new(bsdf_node.inputs['Alpha'], tex_node.outputs['Alpha'])
            mat.blend_method = 'HASHED'
        elif map_type == 'Normal':
            normal_map_node = mat.node_tree.nodes.new('ShaderNodeNormalMap')
            normal_map_node.parent = frame
            normal_map_node.location = (-800, -300 * index)  # Example positioning
            mat.node_tree.links.new(normal_map_node.inputs['Color'], tex_node.outputs['Color'])
            mat.node_tree.links.new(bsdf_node.inputs['Normal'], normal_map_node.outputs['Normal'])
        elif map_type == 'Roughness':
            sep_color_node_roughness = mat.node_tree.nodes.new('ShaderNodeSeparateColor')
            sep_color_node_roughness.parent = frame
            sep_color_node_roughness.location = (-800, -300 * index)  # Example positioning
            # Link the texture node to the 'Separate RGB' node
            mat.node_tree.links.new(sep_color_node_roughness.inputs['Color'], tex_node.outputs['Color'])
            # Link the red channel of 'Separate RGB' to the Roughness input of the Principled BSDF
            mat.node_tree.links.new(bsdf_node.inputs['Roughness'], sep_color_node_roughness.outputs['Red'])
        elif map_type == 'Specular':

            # Create separate color node
            sep_color_node_specular = mat.node_tree.nodes.new('ShaderNodeSeparateColor')
            sep_color_node_specular.parent = frame
            sep_color_node_specular.location = (-800, -300 * index)  # Example positioning

            # blender 4.x
            if bpy.app.version[0] == 4:
                spec_math_node1 = mat.node_tree.nodes.new('ShaderNodeMath')
                spec_math_node1.operation = 'MULTIPLY'
                spec_math_node1.inputs[1].default_value = -0.4
                spec_math_node1.parent = frame
                spec_math_node1.location = (-600, -300 * index)
                spec_math_node2 = mat.node_tree.nodes.new('ShaderNodeMath')
                spec_math_node2.operation = 'ADD'
                spec_math_node2.inputs[1].default_value = 1.0
                spec_math_node2.parent = frame
                spec_math_node2.location = (-400, -300 * index)
                spec_math_node3 = mat.node_tree.nodes.new('ShaderNodeMath')
                spec_math_node3.operation = 'DIVIDE'
                spec_math_node3.inputs[0].default_value = 2.0
                spec_math_node3.parent = frame
                spec_math_node3.location = (-200, -300 * index)
                spec_math_node4 = mat.node_tree.nodes.new('ShaderNodeMath')
                spec_math_node4.operation = 'ADD'
                spec_math_node4.inputs[1].default_value = -1.0
                spec_math_node4.parent = frame
                spec_math_node4.location = (0, -300 * index)
                # Refletivity -> IOR

                # Link the texture node to the 'Separate RGB' node
                mat.node_tree.links.new(sep_color_node_specular.inputs['Color'], tex_node.outputs['Color'])

                # Link the red channel of 'Separate RGB' to the Specular input of the Principled BSDF
                mat.node_tree.links.new(spec_math_node1.inputs[0], sep_color_node_specular.outputs['Red'])
                mat.node_tree.links.new(spec_math_node2.inputs[0], spec_math_node1.outputs[0])
                mat.node_tree.links.new(spec_math_node3.inputs[1], spec_math_node2.outputs[0])
                mat.node_tree.links.new(spec_math_node4.inputs[0], spec_math_node3.outputs[0])
                # IOR
                mat.node_tree.links.new(bsdf_node.inputs['IOR'], spec_math_node4.outputs[0])
            else:
                # Link the texture node to the 'Separate RGB' node
                mat.node_tree.links.new(sep_color_node_specular.inputs['Color'], tex_node.outputs['Color'])
                # Link the red channel of 'Separate RGB' to the Specular input of the Principled BSDF
                mat.node_tree.links.new(bsdf_node.inputs['Specular'], sep_color_node_specular.outputs['Red'])
        elif map_type == 'Key':
            mat.node_tree.links.new(bsdf_node.inputs['Alpha'], tex_node.outputs['Alpha'])

        # Position the frame
        frame.location = (-1000, -300 * index)  # Example positioning


    # Assign the material to the object
    if len(plane_obj.data.materials):
        plane_obj.data.materials[0] = mat
    else:
        plane_obj.data.materials.append(mat)

    # Remove the default material output node
    default_output_node = mat.node_tree.nodes.get('Material Output')
    if default_output_node:
        mat.node_tree.nodes.remove(default_output_node)

    # Create three new material output nodes
    output_node_full = next((node for node in mat.node_tree.nodes if node.type == 'OUTPUT_MATERIAL' and node.name == "Output_Full"), None)
    if not output_node_full:
        output_node_full = mat.node_tree.nodes.new('ShaderNodeOutputMaterial')
        output_node_full.location = (500, 0)
        output_node_full.name = "Output_Full"

    # Connect the BSDF shaders to the Material Output nodes
    mat.node_tree.links.new(output_node_full.inputs['Surface'], bsdf_node.outputs['BSDF'])


def update_plane_scale(scene):
    cam = bpy.data.objects['ARCamera']  # Replace with your camera name
    plane = bpy.data.objects['SwitchLightPlane']  # Replace with your plane name
   # Calculate the field of view in the vertical direction
    sensor_height = cam.data.sensor_height
    focal_length = cam.data.lens
    fov_vertical = 2 * math.atan((sensor_height / (2 * focal_length)))

    aspect_ratio = scene.render.resolution_x / scene.render.resolution_y

    # Calculate the plane scales
    plane.scale.y = DISTANCE_FROM_CAMERA * math.tan(fov_vertical / 2) * 2
    plane.scale.x = plane.scale.y * aspect_ratio


def import_pbr_sequence_and_camtrack_data(self, context):
    scene = context.scene
    filepath = context.scene.tool.camtrack_file_path

    # Parse json data
    with open(filepath, 'r') as f:
        data = json.load(f)

    # Pull out relevant properties
    render_data = data.get('render_data') or {}
    camera_frames = data.get('camera_frames') or []
    camera_timestamps = camera_frames.get('timestamps') or []
    camera_transforms = camera_frames.get('transforms') or []
    camera_datas = camera_frames.get('datas') or []
    planes = data.get('planes') or []
    tracked_transforms = data.get('tracked_transforms') or []

    resolution_x = render_data['video_resolution_x']
    resolution_y = render_data['video_resolution_y']

    camera_rotation = IDENTITY_MATRIX
    video_orientation = render_data['orientation']
    if video_orientation == ORIENTATION_PORTRAIT:
        camera_rotation = ROTATE_PORTRAIT
    elif video_orientation == ORIENTATION_LANDSCAPE_LEFT:
        camera_rotation = ROTATE_LANDSCAPE_LEFT
    elif video_orientation == ROTATE_LANDSCAPE_RIGHT:
        camera_rotation = ROTATE_LANDSCAPE_RIGHT

    # Render settings that we want to switch all the time
    scene.render.ffmpeg.audio_codec = 'AAC'

    # Setup render settings
    fps = render_data['fps']
    scene.render.fps = fps
    scene.render.resolution_x = resolution_x
    scene.render.resolution_y = resolution_y
    scene.render.film_transparent = False

    # Setup scene settings

    print("Camera Timestamp", len(camera_timestamps))
    if len(camera_timestamps) > 0:
        scene.frame_end = max(int(math.ceil(camera_timestamps[-1] * fps)), 1)

    bpy.ops.object.add()
    root = context.object
    root.name = 'SL CamTrack'

    # Create camera
    bpy.ops.object.camera_add(enter_editmode=False)
    cam = context.active_object
    cam.data.sensor_fit = 'VERTICAL'
    cam.data.lens_unit = 'MILLIMETERS'
    cam.data.clip_start = 0.1
    cam.data.clip_end = 1000.0

    cam.name = 'ARCamera'
    cam.parent = root

    # # Setup video background
    video_filepath = filepath.replace('camera.json', 'raw.mp4')

    # Ensure that there's a sequencer
    if not scene.sequence_editor:
        scene.sequence_editor_create()


    # Add the video background audio clip to the sequencer
    # check file existence of video_filepath
    if os.path.isfile(video_filepath):
        scene.sequence_editor.sequences.new_sound('background_audio', video_filepath, 1, 1)

    # Switch the 3D windows to view through the new camera with the background
    for screen in context.workspace.screens:
        for area in screen.areas:
            for space in area.spaces:
                if space.type == 'VIEW_3D':
                    space.camera = cam
                    # space.region_3d.view_perspective = 'CAMERA'

    # Create camera animation
    for idx, timestamp in enumerate(camera_timestamps):
        try:
            mat = mathutils.Matrix(camera_transforms[idx])
            data = camera_datas[idx]
        except IndexError:
            continue
        focal_length, sensor_height = data[0], data[1]

        frameidx = max(int(math.ceil(timestamp * fps)), 1)

        scene.frame_set(frameidx)

        cam.data.lens = focal_length
        cam.data.sensor_height = sensor_height
        assert cam.data.keyframe_insert('lens', frame=frameidx), 'Could not insert lens keyframe'

        cam.matrix_world = UNITY2BLENDER @ (mat @ camera_rotation)

        # Note that we only save the loc and rot keyframes, but it does apply the scale to the camera
        bpy.ops.anim.keyframe_insert_menu(type='BUILTIN_KSI_LocRot')

    # Rewind back to the first frame
    scene.frame_set(1)

    # After setting up the camera, call the function to add the plane
    add_plane_fitted_to_camera_view(context, cam)

    # Attach the function to frame change handler
    bpy.app.handlers.frame_change_pre.append(update_plane_scale)

    # Add planes
    for plane_index, plane in enumerate(planes):
        bpy.ops.mesh.primitive_plane_add(size=1.0, calc_uvs=True, enter_editmode=False, align='WORLD')
        plane_obj = context.object
        plane_obj.parent = root
        plane_obj.name = '%s Plane [%d]' % (plane['alignment'].capitalize(), plane_index + 1)
        plane_obj.display_type = 'WIRE'
        plane_obj.hide_render = True
        plane_obj.matrix_world = (UNITY2BLENDER @ mathutils.Matrix(plane['transform']))

        # Make sure cycles visibility is also disabled, first using the older method of `cycles_visibility``
        visibility = getattr(plane_obj, 'cycles_visibility', None)
        if visibility is not None:
            visibility.camera = False
            visibility.diffuse = False
            visibility.glossy = False
            visibility.transmission = False
            visibility.scatter = False

        # Then using the newer method of `visible_*`
        plane_obj.visible_camera = False
        plane_obj.visible_diffuse = False
        plane_obj.visible_glossy = False
        plane_obj.visible_shadow = False
        plane_obj.visible_transmission = False
        plane_obj.visible_volume_scatter = False

    # Add tracked empty transforms
    for track_index, tfm in enumerate(tracked_transforms):
        bpy.ops.object.add()
        tracked_obj = context.object
        tracked_obj.parent = root
        tracked_obj.name = 'Anchor [%d]' % (track_index + 1,)
        tracked_obj.empty_display_size = 0.2
        tracked_obj.matrix_world = UNITY2BLENDER @ mathutils.Matrix(tfm)

    # Select the camera object again so that the user can adjust any keyframes as needed
    for obj in bpy.data.objects:
        obj.select_set(False)
    cam.select_set(True)

    return {'FINISHED'}


def add_plane_fitted_to_camera_view(context, cam):
    bpy.ops.mesh.primitive_plane_add(size=1, enter_editmode=False, align='WORLD')
    plane = context.object
    plane.name = "SwitchLightPlane"

    # Set the plane's initial position to the camera's position
    plane.location = cam.location

    # Calculate the height and width of the plane based on FOV and distance from camera
    aspect_ratio = context.scene.render.resolution_x / context.scene.render.resolution_y

    # Resizing the plane
    plane.scale.x = DISTANCE_FROM_CAMERA * aspect_ratio
    plane.scale.y = DISTANCE_FROM_CAMERA

    # TODO: RPY rotation
    # Setting the rotation of the plane to match the camera
    plane.rotation_euler = cam.rotation_euler

    # Offset the plane along the camera's local -Z axis (viewing direction)
    offset_direction = cam.matrix_world.to_quaternion() @ mathutils.Vector((0, 0, -DISTANCE_FROM_CAMERA))
    plane.location += offset_direction

    # Apply Child Of constraint to make the plane follow the camera
    child_of_constraint = plane.constraints.new('CHILD_OF')
    child_of_constraint.target = cam

    # Apply Track To constraint to make the plane always face the camera
    track_to_constraint = plane.constraints.new('TRACK_TO')
    track_to_constraint.target = cam
    track_to_constraint.track_axis = 'TRACK_Z'
    track_to_constraint.up_axis = 'UP_Y'

    # Apply Copy Rotation constraint to make the plane follow the camera's rotation
    copy_rot_constraint = plane.constraints.new('COPY_ROTATION')
    copy_rot_constraint.target = cam
    copy_rot_constraint.use_offset = False  # The plane's rotation will match exactly the camera's rotation

    selected_directory = bpy.context.scene.tool.pbr_path

    map_paths = {
        'Albedo': glob.glob(os.path.join(selected_directory, "albedo/albedo_*")),
        'Normal': glob.glob(os.path.join(selected_directory, "normal/normal_*")),
        'Roughness': glob.glob(os.path.join(selected_directory, "roughness/roughness_*")),
        'Specular': glob.glob(os.path.join(selected_directory, "specular/specular_*")),
        'Key': glob.glob(os.path.join(selected_directory, "key/key_*")),
    }

    frame_start = 1
    frame_end = min(context.scene.frame_end, len(map_paths['Albedo']))  # Assuming all maps have the same number of frames

    create_material(plane, map_paths, frame_start, frame_end)


def import_pbr_sequence(context):

    selected_directory = bpy.context.scene.tool.pbr_path

    map_paths = {
        'Albedo': glob.glob(os.path.join(selected_directory, "albedo/albedo_*")),
        'Normal': glob.glob(os.path.join(selected_directory, "normal/normal_*")),
        'Roughness': glob.glob(os.path.join(selected_directory, "roughness/roughness_*")),
        'Specular': glob.glob(os.path.join(selected_directory, "specular/specular_*")),
        'Key': glob.glob(os.path.join(selected_directory, "key/key_*")),
    }

    frame_start = 1
    frame_end = len(map_paths['Albedo'])  # Assuming all maps have the same number of frames

    # Set the scene's end frame to match the sequence length
    bpy.context.scene.frame_start = frame_start
    bpy.context.scene.frame_end = frame_end

    albedo_img = bpy.data.images.load(map_paths['Albedo'][0])
    width, height = albedo_img.size
    bpy.context.scene.render.resolution_x = width
    bpy.context.scene.render.resolution_y = height

    # Create a plane with the dimensions of the albedo texture
    bpy.ops.mesh.primitive_plane_add(size=1, calc_uvs=True, enter_editmode=False, align='WORLD')
    plane_obj = context.object
    plane_obj.name = "SwitchLightPlane"  # Assign your custom name to the plane
    plane_obj.rotation_euler.x = math.radians(90)  # Rotate the plane 90 degrees on the x-axis

    # Create and assign material
    create_material(plane_obj, map_paths, frame_start, frame_end)

    # Set up camera
    cam_data = bpy.data.cameras.new(name="SwitchLightCamera")
    cam_obj = bpy.data.objects.new(name="SwitchLightCamera", object_data=cam_data)
    context.collection.objects.link(cam_obj)
    cam_obj.rotation_euler = (math.radians(90), 0.0, 0.0)
    cam_data.sensor_fit = 'VERTICAL'
    cam_data.lens_unit = 'MILLIMETERS'
    cam_data.clip_start = 0.1
    cam_data.clip_end = 1000.0

    sensor_height = cam_data.sensor_height
    focal_length = cam_data.lens
    fov_vertical = 2 * math.atan((sensor_height / (2 * focal_length)))

    plane_obj.location = (0.0, 0.0, 0.0)  # Set the Z value to the calculated distance
    cam_obj.location = (0.0, -DISTANCE_FROM_CAMERA, 0.0)  # Set the Z value to the calculated distance

    aspect_ratio = width / height

    # Calculate the plane scales
    plane_obj.scale.y = DISTANCE_FROM_CAMERA * math.tan(fov_vertical / 2) * 2
    plane_obj.scale.x = plane_obj.scale.y * aspect_ratio

    # Set up point light
    light_data = bpy.data.lights.new(name="SwitchLightPointLight", type='POINT')
    light_obj = bpy.data.objects.new(name="SwitchLightPointLight", object_data=light_data)
    context.collection.objects.link(light_obj)
    # 0.1 meters above the plane
    if bpy.app.version[0] == 4:
        light_obj.location = (
            plane_obj.location.x + plane_obj.scale.x / 2,
            plane_obj.location.y - 0.1,
            plane_obj.location.z,
        )
    else:
        light_obj.location = (0.0, 0.0, plane_obj.location.z + 0.1)


def update_camtrack_file_path(self, context):
    self.camtrack_file_path = os.path.join(self.camtrack_path, "camera.json")


""" Export the rendered image """
# Property group containing a string property for the directory path
class DirProperties(bpy.types.PropertyGroup):
    path: bpy.props.StringProperty(
        name="Directory",
        description="Choose an Output directory:",
        default="",
        maxlen=1024,
        subtype='DIR_PATH')

    pbr_path: bpy.props.StringProperty(
        name="PBR Directory",
        description="Choose a PBR directory:",
        default="",
        maxlen=1024,
        subtype='DIR_PATH'
    )

    camtrack_path: bpy.props.StringProperty(
        name="SL CamTrack Directory",
        description="Choose SL CamTrack Directory:",
        default="",
        maxlen=1024,
        subtype='DIR_PATH',
        update=update_camtrack_file_path)

    camtrack_file_path: bpy.props.StringProperty(
        name="SL CamTrack Directory",
        description="Choose SL CamTrack Data:",
        default="",
        maxlen=1024,
        subtype='FILE_PATH')

# class ImportCamTrackFile(Operator, ImportHelper):
#     bl_idname = "beeble.sl_camtrack"
#     bl_label = "SL CamTrack File (.json)"

#     # ImportHelper mixin class uses this
#     filename_ext = ".json"

#     filter_glob: StringProperty(
#         default="*.json",
#         options={'HIDDEN'},
#         maxlen=255,  # Max internal buffer length, longer would be clamped.
#     )

#     def execute(self, context):
#         context.scene.tool.camtrack_file_path = self.filepath
#         return {'FINISHED'}

#     def draw(self, context):
#         pass

# class ImportCamTrackFileSettings(Panel):
#     bl_space_type = 'FILE_BROWSER'
#     bl_region_type = 'TOOL_PROPS'
#     bl_label = "CamTrackFile Import Settings"

#     @classmethod
#     def poll(cls, context):
#         operator = context.space_data.active_operator
#         return operator.bl_idname == bpy.ops.beeble.sl_camtrack.idname()

#     def draw(self, context):
#         layout = self.layout
#         layout.use_property_split = False
#         layout.use_property_decorate = False  # No animation.

#         layout.prop(context.scene, 'switch_to_cam')

class SwitchLightStudioPanel(bpy.types.Panel):
    bl_label = "SwitchLight Studio"
    bl_idname = "OBJECT_PT_simple_operator"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'SwitchLight Studio'

    def draw(self, context):
        layout = self.layout

        col = layout.column(align=True)
        col.label(text="SL CamTrack Directory")
        col.label(text="(Optional)")
        layout.prop(context.scene.tool, "camtrack_path", text="")

        # Load PBR Sequence
        layout.label(text="PBR Directory")
        layout.prop(context.scene.tool, "pbr_path", text="")

        # Button to create a plane
        layout.operator("object.load_pbr_sequence_operator")

        # Adding a divider
        layout.separator()

        # SL Track Data (read-only)
        if context.scene.camera:
            layout.label(text="SL Track Data")
            # Temporarily disable the layout to make properties read-only
            row = layout.row()
            row.enabled = False
            row.prop(context.scene.render, "fps", text="FPS")
            row = layout.row()
            row.enabled = False
            row.prop(context.scene.camera.data, "lens", text="Focal Length")
            row = layout.row()
            row.enabled = False
            row.prop(context.scene.camera.data, "sensor_height", text="Sensor Height")
            row = layout.row()
            row.enabled = False
            row.prop(context.scene.render, "resolution_x", text="Resolution_X")
            row = layout.row()
            row.enabled = False
            row.prop(context.scene.render, "resolution_y", text="Resolution_Y")

class LoadPBRSequenceOperator(bpy.types.Operator):
    bl_idname = "object.load_pbr_sequence_operator"
    bl_label = "Load PBR Sequence"

    def execute(self, context):
        if not context.scene.tool.camtrack_file_path:
            import_pbr_sequence(context)
        else:
            import_pbr_sequence_and_camtrack_data(self, context)

        return {'FINISHED'}

def register():
    # Register the operator and panel
    bpy.utils.register_class(LoadPBRSequenceOperator)
    bpy.utils.register_class(SwitchLightStudioPanel)
    bpy.utils.register_class(DirProperties)
    bpy.types.Scene.tool = bpy.props.PointerProperty(type=DirProperties)

def unregister():
    # Unregister the operator and panel
    bpy.utils.unregister_class(LoadPBRSequenceOperator)
    bpy.utils.unregister_class(SwitchLightStudioPanel)
    bpy.utils.unregister_class(DirProperties)

    # Remove the custom property from the Scene type
    if hasattr(bpy.types.Scene, 'tool'):
        del bpy.types.Scene.tool

if __name__ == "__main__":
    register()
