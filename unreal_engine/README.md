# SwitchLight PBR Loader Script for UE

## Overview

This Python script automates the import and application of SwitchLight PBR materials in Unreal Engine.
<br>

Key features include:
- Creation of Img Media Sources, Media textures, and Media players from PBR maps.
- BSDF material setup with integrated color space conversion and normal map processing.
- Level Sequencer setup for rendering 3D scenes and materials using the Movie Render Queue.

#### Prerequisites

- Unreal Engine 5.3 (tested on Windows)

## Table of Content

1. [Preparation](#1-preparation)
     - [1-1. Script Download](#1-1-script-download)
     - [1-2. Start Unreal Editor](#1-2-start-unreal-editor)
     - [1-3. Enable Python Editor Script Plugin](#1-3-enable-python-editor-script-plugin)
     - [1-4. Execute the SwitchLight PBR Loader Script](#1-4-execute-the-switchlight-pbr-loader-script)
2. [Usage](#2-usage)
     - [2-1. Load PBR Maps Using the Script](#2-1-load-pbr-maps-using-the-script)
     - [2-2. Render Using Movie Render Queue](#2-2-render-using-movie-render-queue)
3. [FAQ](#faq)


### 1. Preparation

#### 1-1. Script Download

1. Download the `pbr_loader.py` script from this repository:
   [Download pbr_loader.py](https://github.com/beeble-ai/SwitchLight-Studio/unreal/pbr_loader.py)

#### 1-2. Start Unreal Editor

1. Launch Unreal Engine.

<img src="https://desktop.beeble.ai/public/unreal_readme/open_project_1.png" alt="Remove Objects" width="750" height="420"/>

<br>

2. Open a new project; we recommend choosing a blank template in the FILM / VIDEO & LIVE EVENTS category.

<img src="https://desktop.beeble.ai/public/unreal_readme/open_project_2.png" alt="Remove Objects" width="500" height="300"/>

<br>

#### 1-3. Enable Python Editor Script Plugin

1. Navigate through 'Edit' > 'Plugins'.

<img src="https://desktop.beeble.ai/public/unreal_readme/python_plugin_0.png" alt="Install add-on" width="750" height="420"/>

<br>

2. Find the Python Editor Script Plugin and check the box next to it if it's not already ticked.

<img src="https://desktop.beeble.ai/public/unreal_readme/python_plugin_1.png" alt="Install add-on" width="750" height="420"/>

<br>

#### 1-4. Execute the SwitchLight PBR Loader script

1. Navigate through 'Edit' > 'Execute Python Script...'.

<img src="https://desktop.beeble.ai/public/unreal_readme/execute_script_0.png" alt="Open add-on" width="750" height="420"/>

<br>

2. Select the `pbr_loader.py` file you downloaded.

<img src="https://desktop.beeble.ai/public/unreal_readme/execute_script_1.png" alt="Install add-on" width="750" height="420"/>

<br>

3. Once the script is successfully loaded, "SwitchLight Studio" should appear in the toolbar.

<img src="https://desktop.beeble.ai/public/unreal_readme/execute_script_2.png" alt="Import PBR" width="750" height="420"/>


<br>



### 2. Usage

#### 2-1. Load PBR maps using the script

1. Navigate to 'SwitchLight Studio' > 'Import PBR Maps' to select the directory where your PBR map files are stored.

<img src="https://desktop.beeble.ai/public/unreal_readme/load_pbr_sequence_0.png" alt="Import PBR" width="750" height="420"/>

<br>

2. Select the desired PBR map directory. <b>Remember: This directory must include folders for albedo, normal, roughness, specular, and key maps, which can be obtained through SwitchLight Studio's PBR map extraction feature.</b>


<img src="https://desktop.beeble.ai/public/unreal_readme/load_pbr_sequence_1.png" alt="Load PBR" width="750" height="420"/>

<br>

3. After successfully loading the PBR map directory, two actors will be visible in the outliner: 'SwitchLight Camera' and 'SwitchLight Plane'. Also, upon opening 'Content Drawer' (located at bottom), a 'SwitchLight' folder along with its associated assets will be automatically created.

<img src="https://desktop.beeble.ai/public/unreal_readme/load_pbr_sequence_4.png" alt="Load PBR" width="750" height="420"/>

<br>

4. To view and edit the preview of rendered image sequences, select 'PBRSequencer'.


<img src="https://desktop.beeble.ai/public/unreal_readme/pbr_sequencer_0.png" alt="Load PBR" width="750" height="420"/>

<br>

5. Here, you'll find six items: Camera Cut, PBR Textures, and the SwitchLight Camera. To view the scene from the perspective of the SwitchLight Camera, simply click the 'Perspective' button.


<img src="https://desktop.beeble.ai/public/unreal_readme/pbr_sequencer_1.png" alt="Load PBR" width="750" height="420"/>

<br>

6. If you want to learn about the SwitchLight material node graphs, simply click on 'PBRMaterial' in 'Content Drawer'.

<img src="https://desktop.beeble.ai/public/unreal_readme/pbr_material_2.png" alt="Load PBR" width="750" height="420"/>

<br>

<img src="https://desktop.beeble.ai/public/unreal_readme/node_setup.png" alt="Load PBR" width="750" height="420"/>

Detailed explanations of the node graphs will be provided shortly!

#### 2-2: Render using Movie Render Queue.

1. Make sure that the movie render queue plugin is enabled.

<img src="https://desktop.beeble.ai/public/unreal_readme/movie_render_queue.png" alt="Completion" width="750" height="420"/>

<br>


2. Click on the button shown in the image below.

<br>
<img src="https://desktop.beeble.ai/public/unreal_readme/render.png" alt="Completion" width="750" height="420"/>

<br>

3. Click on the 'Render (Local)' button. In case the 'Movie Render Queue' window doesn't appear, verify that the Movie Render Queue plugin is enabled.

<br>

<img src="https://desktop.beeble.ai/public/unreal_readme/render2.png" alt="Completion" width="750" height="420"/>

<br>

4. Rendered results will be saved under your Unreal Project folder.

<br>

<img src="https://desktop.beeble.ai/public/unreal_readme/render4.png" alt="Completion" width="750" height="420"/>



## 3. FAQ

### 3-1. Why are my rendered results in the viewport too glossy, and how can I fix it?

Often, the viewport's preview can differ from the final output so try rendering. If the glossiness issue persists, please report this to us for further assistance.


### 3-2. Can I use path-tracing with SwitchLight?

No. Path tracing is designed to replicate how light interacts in the real-world. SwitchLight uses 2D planes to mimic 3D geometry, which disrupts the path-tracing process. For instance, a 2D plane in SwitchLight will block photons from reaching its front surface if the light source is behind it, making effects like rim lighting unachievable with path-tracing. Additionally, using path-tracing with SwitchLight can result in various artifacts.


### 3-3. Which renderer should I use with SwitchLight PBR maps?
For rendering PBR (Physically Based Rendering) maps in SwitchLight, we suggest using ThreeJS, Unreal Engine 5's Lumen, and Blender’s EEVEE. These renderers have been tested and confirmed to produce accurate results. To ensure proper setup of PBR maps, users are advised to use the official plugins provided for Blender and Unreal Engine, as the setup process can be complex.


### 3-4. Is there a future plan for 3D geometry?
Yes. This is actually one of our major milestone for Q1 next year. Please stay tuned.



