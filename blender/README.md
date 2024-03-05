# SwitchLight PBR Loader Add-on for Blender

## Overview

This Python script automates the import and application of SwitchLight PBR materials in Blender.
<br>
Additionally, it supports importing camera tracking data and virtual anchors from the SL CamTrack app (available for iOS), for those who record scenes using this app.
<br>

Key features include:

- BSDF material setup with integrated color space conversion.
- (Optional) Import of camera tracking data and virtual anchor setup from the SL CamTrack app

#### Prerequisites

- Blender 3.x & 4.x

## Table of Content

1. [Preparation](#1-preparation)
   - [1.1 Script Download](#11-script-download)
   - [1.2 Start Blender](#12-start-blender)
   - [1.3 Blender Addon Installation](#13-plugin-installation)
2. [Recommended Blender Setup](#2-recommended-setup)
   - [2.1 Use Eevee](#22-use-Eevee)
3. [(Optional) SL CamTrack Integration](#3-sl-camtrack-integration)
   - [3.1 Overview of SL CamTrack](#31-overview-of-sl-camtrack)
   - [3.2 Recording Scenes with SL CamTrack](#32-recording-scenes-with-sl-camtrack)
   - [3.3 How to Use SL CamTrack in Blender](#33-how-to-use-sl-camtrack-in-blender)
4. [Usage](#4-usage)
   - [4.1 Load PBR Maps Using the Script](#41-load-pbr-maps-using-the-script)
5. [FAQ](#5-faq)
   - [5.1 Can I use path-tracing with SwitchLight?](#51-can-i-use-path-tracing-with-switchlight)
   - [5.2 Which renderer should I use with SwitchLight PBR maps?](#52-which-renderer-should-i-use-with-switchlight-pbr-maps)
   - [5.3 Is there a future plan for 3D geometry?](#53-is-there-a-future-plan-for-3d-geometry)

### 1. Preparation

#### 1.1 Script Download

1. Download the `pbr_loader_blender.py` script from this repository:
   [Download pbr_loader_blender.py](https://github.com/beeble-ai/SwitchLight-Studio/blob/main/blender/pbr_loader_blender.py)

   If you are an enterprise user, you can find `pbr_loader_blender.py` in the downloaded zip file.

#### 1.2 Start Blender

1. Launch Blender and optionally clear the default objects from the scene.
   
   ![Remove Objects](https://desktop.beeble.ai/public/blender_readme/2_1_remove_object.png)

#### 1.3 Plugin Installation

1. Navigate through 'Edit' > 'Preferences'.

   ![Install add-on 1](https://desktop.beeble.ai/public/blender_readme/3_0_preference.png)

2. Click on 'Install...'.

   ![Install add-on 2](https://desktop.beeble.ai/public/blender_readme/3_1_install_button.png)

4. Select the `pbr_loader_blender.py` file you downloaded.

   ![Install add-on 3](https://desktop.beeble.ai/public/blender_readme/3_2_select_pbr_loader.png)

6. Tick the checkbox to enable the SwitchLight Add-on.

   ![Activate add-on 4](https://desktop.beeble.ai/public/blender_readme/3_3_activate_addon.png)

### 2. Recommended Setup

#### 2.1 Use Eevee

1. Use Eevee for rendering

   ![Eevee](https://desktop.beeble.ai/public/blender_readme/eevee.png)


### 3. (Optional) SL CamTrack Integration

#### 3.1 Overview of SL CamTrack

SL CamTrack is a part of SL Studio. It's designed for those who want to record scenes with camera tracking. <br>
With SL CamTrack, you can obtain segmentation masks, depth, and camera tracking data. <br>
Currently, SL CamTrack is available only on iOS: [View in the App Store](https://apps.apple.com/app/sl-camtrack/id6474220970).

#### 3.2 Recording Scenes with SL CamTrack

Coming soon

#### 3.3 How to Use SL CamTrack in Blender

Coming soon

### 4. Usage

#### 4.1 Load PBR Maps Using the Script

1. Open the SwitchLight Add-on from the sidebar.

   ![Open add-on](https://desktop.beeble.ai/public/blender_readme/4_0_click_addon.png)

2. Import your desired SwitchLight PBR sequence. <b>The selected directory should contain SwitchLight PBR map folders (i.e., albedo, normal, roughness, and specular).</b>

   ![Import PBR](https://desktop.beeble.ai/public/blender_readme/4_2_load_pbr.png)

3. Click 'Load PBR Sequence' button.

   ![Load PBR](https://desktop.beeble.ai/public/blender_readme/4_2_load_pbr_2.png)

4. Then, you will see the newly created SwitchLightPlane, SwitchLightCamera, and SwitchLightPointLight.

   ![Apply PBR](https://desktop.beeble.ai/public/blender_readme/4_4_load_pbr_3_updated.png)

5. Confirm the setup by clicking the parts as illustrated.

   ![Completion](https://desktop.beeble.ai/public/blender_readme/5_0_completion_updated_2.png)

## 5. FAQ

### 5.1 Can I use Cycle with SwitchLight?

No. Cycle (path-tracing) is designed to replicate how light interacts in the real-world. SwitchLight uses 2D planes to mimic 3D geometry, which disrupts the path-tracing process. For instance, a 2D plane in SwitchLight will block photons from reaching its front surface if the light source is behind it, making effects like rim lighting unachievable with path-tracing. Additionally, using path-tracing with SwitchLight can result in various artifacts.

### 5.2 Which renderer should I use with SwitchLight PBR maps?

For rendering PBR (Physically Based Rendering) maps in SwitchLight, we suggest using ThreeJS, Unreal Engine 5's Lumen, and Blender’s EEVEE. These renderers have been tested and confirmed to produce accurate results. To ensure proper setup of PBR maps, users are advised to use the official plugins provided for Blender and Unreal Engine, as the setup process can be complex.

### 5.3 Is there a future plan for 3D geometry?

Yes. This is actually one of our major milestones for Q1 next year. Please stay tuned.
