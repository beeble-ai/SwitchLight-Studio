bl_info = {
    "name": "SwitchLight Studio",
    "author": "Beeble Inc.",
    'description': 'SwitchLight Studio Plugin for Blender',
    'version': (0, 0, 4),
    'blender': (2, 80, 0),
    'location': '3D View',
    'warning': '',
    "category": "3D View",
}

import os
import math
import glob
import bpy

DISTANCE_FROM_CAMERA = 1


def create_material(plane_obj, map_paths, frame_start, frame_end):
    # Create a new material
    mat = bpy.data.materials.new(name="GeneratedMaterial")
    mat.use_nodes = True

    for node in mat.node_tree.nodes:
        mat.node_tree.nodes.remove(node)

    # Create two Principled BSDF nodes
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
            mat.node_tree.links.new(bsdf_node.inputs['Roughness'], tex_node.outputs['Color'])
        elif map_type == 'Specular':
            # blender 4.x
            if bpy.app.version[0] == 4:
                spec_math_node1 = mat.node_tree.nodes.new('ShaderNodeMath')
                spec_math_node1.operation = 'MULTIPLY'
                spec_math_node1.inputs[1].default_value = -0.4
                spec_math_node1.parent = frame
                spec_math_node1.location = (-800, -300 * index)
                spec_math_node2 = mat.node_tree.nodes.new('ShaderNodeMath')
                spec_math_node2.operation = 'ADD'
                spec_math_node2.inputs[1].default_value = 1.0
                spec_math_node2.parent = frame
                spec_math_node2.location = (-600, -300 * index)
                spec_math_node3 = mat.node_tree.nodes.new('ShaderNodeMath')
                spec_math_node3.operation = 'DIVIDE'
                spec_math_node3.inputs[0].default_value = 2.0
                spec_math_node3.parent = frame
                spec_math_node3.location = (-400, -300 * index)
                spec_math_node4 = mat.node_tree.nodes.new('ShaderNodeMath')
                spec_math_node4.operation = 'ADD'
                spec_math_node4.inputs[1].default_value = -1.0
                spec_math_node4.parent = frame
                spec_math_node4.location = (-200, -300 * index)
                # Refletivity -> IOR
                mat.node_tree.links.new(spec_math_node1.inputs[0], tex_node.outputs['Color'])
                mat.node_tree.links.new(spec_math_node2.inputs[0], spec_math_node1.outputs[0])
                mat.node_tree.links.new(spec_math_node3.inputs[1], spec_math_node2.outputs[0])
                mat.node_tree.links.new(spec_math_node4.inputs[0], spec_math_node3.outputs[0])
                # IOR
                mat.node_tree.links.new(bsdf_node.inputs['IOR'], spec_math_node4.outputs[0])
            else:
                mat.node_tree.links.new(bsdf_node.inputs['Specular'], tex_node.outputs['Color'])
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



def import_pbr_sequence(context):

    selected_directory = bpy.context.scene.my_tool.pbr_path

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

    bpy.context.scene.world.color = (0, 0, 0)  # Set world color to black
    bpy.context.scene.world.use_nodes = False  # Disable use of environment texture

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

class SwitchLightStudioPanel(bpy.types.Panel):
    bl_label = "SwitchLight Studio"
    bl_idname = "OBJECT_PT_simple_operator"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'SwitchLight Studio'

    def draw(self, context):
        layout = self.layout

        # Load PBR Sequence
        layout.label(text="Select PBR Directory")
        layout.prop(context.scene.my_tool, "pbr_path", text="")

        # Button to create a plane
        layout.operator("object.load_pbr_sequence_operator")


class LoadPBRSequenceOperator(bpy.types.Operator):
    bl_idname = "object.load_pbr_sequence_operator"
    bl_label = "Load PBR Sequence"

    def execute(self, context):
        import_pbr_sequence(context)
        return {'FINISHED'}

def register():
    # Register the operator and panel
    bpy.utils.register_class(LoadPBRSequenceOperator)
    bpy.utils.register_class(SwitchLightStudioPanel)
    bpy.utils.register_class(DirProperties)
    bpy.types.Scene.my_tool = bpy.props.PointerProperty(type=DirProperties)

def unregister():
    bpy.utils.unregister_class(LoadPBRSequenceOperator)
    bpy.utils.unregister_class(SwitchLightStudioPanel)
    bpy.utils.unregister_class(DirProperties)

if __name__ == "__main__":
    register()
