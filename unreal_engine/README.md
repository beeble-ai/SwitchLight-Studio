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
   - [1.1 Script Download](#11-script-download)
   - [1.2 Start Unreal Editor](#12-start-unreal-editor)
   - [1.3 Enable Python Editor Script Plugin](#13-enable-python-editor-script-plugin)
   - [1.4 Execute the SwitchLight PBR Loader Script](#14-execute-the-switchlight-pbr-loader-script)
2. [Recommended Setup](#2-recommended-setup)
   - [2.1 High Quality Translucency Reflections](#21-high-quality-translucency-reflections)
   - [2.2 Use Lumen for Reflections & Global Illumination](#22-use-lumen-for-reflections--global-illumination)
   - [2.3 Support Hardware Raytracing](#23-support-hardware-raytracing)
3. [Usage](#3-usage)
   - [3.1 Load PBR Maps Using the Script](#31-load-pbr-maps-using-the-script)
   - [3.2 Render Using Movie Render Queue](#32-render-using-movie-render-queue)
4. [FAQ](#4-faq)
   - [4.1 Why are my rendered results in the viewport too glossy?](#41-why-are-my-rendered-results-in-the-viewport-too-glossy)
   - [4.2 Can I use path-tracing with SwitchLight?](#42-can-i-use-path-tracing-with-switchlight)
   - [4.3 Which renderer should I use with SwitchLight PBR maps?](#43-which-renderer-should-i-use-with-switchlight-pbr-maps)
   - [4.4 Is there a future plan for 3D geometry?](#44-is-there-a-future-plan-for-3d-geometry)


### 1. Preparation

#### 1.1 Script Download

1. Download the `pbr_loader.py` script from this repository:
   [Download pbr_loader.py](https://github.com/beeble-ai/SwitchLight-Studio/blob/main/unreal_engine/pbr_loader.py)

#### 1.2 Start Unreal Editor

1. Launch Unreal Engine.
   
   ![Open Project Step 1](https://desktop.beeble.ai/public/unreal_readme/open_project_1.png)

2. Open a new project; we recommend choosing a blank template in the FILM / VIDEO & LIVE EVENTS category.
   
   ![Open Project Step 2](https://desktop.beeble.ai/public/unreal_readme/open_project_2.png)

#### 1.3 Enable Python Editor Script Plugin

1. Navigate through 'Edit' > 'Plugins'.
   
   ![Enable Python Plugin](https://desktop.beeble.ai/public/unreal_readme/python_plugin_0.png)

2. Find the Python Editor Script Plugin and check the box next to it if it's not already ticked.
   
   ![Python Plugin Checkbox](https://desktop.beeble.ai/public/unreal_readme/python_plugin_1.png)

#### 1.4 Execute the SwitchLight PBR Loader script

1. Navigate through 'Edit' > 'Execute Python Script...'.
   
   ![Execute Script](https://desktop.beeble.ai/public/unreal_readme/execute_script_0.png)

2. Select the `pbr_loader.py` file you downloaded.
   
   ![Select Script](https://desktop.beeble.ai/public/unreal_readme/execute_script_1.png)

3. Once the script is successfully loaded, "SwitchLight Studio" should appear in the toolbar.
   
   ![SwitchLight Studio Toolbar](https://desktop.beeble.ai/public/unreal_readme/execute_script_2.png)

### 2. Recommended Setup

#### 2.1 High Quality Translucency Reflections

1. Navigate to 'Edit' > 'Project Settings'. Find 'High Quality Translucency Reflections" and make sure to enable this feature to minimize artifacts in the viewport.

   ![High Quality Translucency Reflections](https://desktop.beeble.ai/public/unreal_readme/high_translucency.png)

#### 2.2 Use Lumen for Reflections & Global Illumination

1. Navigate to 'Edit' > 'Project Settings'. Find 'Reflections' & 'Global Illuminations'. Ensure that Lumen is selected for both of these features.
   
   ![Lumen for Reflections and Global Illumination](https://desktop.beeble.ai/public/unreal_readme/lumen.png)


#### 2.3 Support Hardware Raytracing

1. Navigate to 'Edit' > 'Project Settings'. Find 'Support Hardware Raytracing'. and make sure to enable this feature.

   ![Support Hardware Raytracing](https://desktop.beeble.ai/public/unreal_readme/raytracing.png)

### 3. Usage

#### 3.1 Load PBR maps using the script

1. Navigate to 'SwitchLight Studio' > 'Import PBR Maps' to select the directory where your PBR map files are stored.
   
   ![Load PBR Maps Step 1](https://desktop.beeble.ai/public/unreal_readme/load_pbr_sequence_0.png)

2. Select the desired PBR map directory.
   
   ![Load PBR Maps Step 2](https://desktop.beeble.ai/public/unreal_readme/load_pbr_sequence_1.png)

3. After successfully loading the PBR map directory, two actors will be visible in the outliner: 'SwitchLight Camera' and 'SwitchLight Plane'. Also, upon opening 'Content Drawer' (located at bottom), a 'SwitchLight' folder along with its associated assets will be automatically created.
   
   ![Load PBR Maps Step 3](https://desktop.beeble.ai/public/unreal_readme/load_pbr_sequence_4.png)

4. To view and edit the preview of rendered image sequences, select 'PBRSequencer'.
   
   ![PBRSequencer](https://desktop.beeble.ai/public/unreal_readme/pbr_sequencer_0.png)

5. Here, you'll find six items: Camera Cut, PBR Textures, and the SwitchLight Camera. To view the scene from the perspective of the SwitchLight Camera, simply click the 'Perspective' button.
   
   ![PBRSequencer Perspective](https://desktop.beeble.ai/public/unreal_readme/pbr_sequencer_1.png)

6. If you want to learn about the SwitchLight material node graphs, simply click on 'PBRMaterial' in 'Content Drawer'.
   
   ![PBRMaterial](https://desktop.beeble.ai/public/unreal_readme/pbr_material_2.png)

7. This node graph connects PBR textures to the BSDF material, performing color space conversion (when required) and processing of normal maps, to ensure the precise rendering output.
   ![NodeGraph](https://desktop.beeble.ai/public/unreal_readme/node_setup.png)

#### 3.2 Render using Movie Render Queue

1. Make sure that the movie render queue plugin is enabled.
   
   ![Movie Render Queue Plugin](https://desktop.beeble.ai/public/unreal_readme/movie_render_queue.png)

2. Open the sequencer again by clicking 'PBRSequencer' in the 'Content Browser' and then click on the button shown in the image below.
   
   ![Open Sequencer](https://desktop.beeble.ai/public/unreal_readme/render.png)

3. Click on the 'Render (Local)' button. In case the 'Movie Render Queue' window doesn't appear, verify that the Movie Render Queue plugin is enabled.
   
   ![Render Local](https://desktop.beeble.ai/public/unreal_readme/render2.png)

4. Rendered results will be saved under your Unreal Project folder.
   
   ![Rendered Results Location](https://desktop.beeble.ai/public/unreal_readme/render4.png)

## 4. FAQ

### 4.1 Why are my rendered results in the viewport too glossy?

Please make sure to enable high quality translucency reflections.

### 4.2 Can I use path-tracing with SwitchLight?

No. Path tracing is designed to replicate how light interacts in the real-world. SwitchLight uses 2D planes to mimic 3D geometry, which disrupts the path-tracing process. For instance, a 2D plane in SwitchLight will block photons from reaching its front surface if the light source is behind it, making effects like rim lighting unachievable with path-tracing. Additionally, using path-tracing with SwitchLight can result in various artifacts.

### 4.3 Which renderer should I use with SwitchLight PBR maps?

For rendering PBR (Physically Based Rendering) maps in SwitchLight, we suggest using ThreeJS, Unreal Engine 5's Lumen, and Blender’s EEVEE. These renderers have been tested and confirmed to produce accurate results. To ensure proper setup of PBR maps, users are advised to use the official plugins provided for Blender and Unreal Engine, as the setup process can be complex.

### 4.4 Is there a future plan for 3D geometry?

Yes. This is actually one of our major milestones for Q1 next year. Please stay tuned.
