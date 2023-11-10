# SwitchLight PBR Loader Add-on for Blender

## Overview

The SwitchLight PBR Loader Add-on is designed to simplify the process of importing PBR sequences into Blender and creating a new plane automatically for each sequence.

### Prerequisites

Blender installed on your computer.

## Step-by-Step Guide

### Step 1: Add-on Download

1. Download the `pbr_loader.py` script from this repository:
[Download pbr_loader.py](https://github.com/beeble-ai/SwitchLight-Studio/blob/main/blender/pbr_loader.py)

### Step 2: Start Blender

1. Launch Blender and optionally clear the default objects from the scene.

<img src="https://desktop.beeble.ai/public/blender_readme/2_1_remove_object.png" alt="Remove Objects" width="750" height="630"/>

### Step 3: Plugin Installation

1. Navigate through 'Edit' > 'Preferences'.

<img src="https://desktop.beeble.ai/public/blender_readme/3_0_preference.png" alt="Install add-on" width="750" height="630"/>

<br>
2. Click on 'Install...'.

<img src="https://desktop.beeble.ai/public/blender_readme/3_1_install_button.png" alt="Install add-on" width="750" height="630"/>

<br>
3. Select the `pbr_loader.py` file you downloaded.

<img src="https://desktop.beeble.ai/public/blender_readme/3_2_select_pbr_loader.png" alt="Install add-on" width="750" height="630"/>


<br>
4. Tick the checkbox to enable the SwitchLight Add-on.

<img src="https://desktop.beeble.ai/public/blender_readme/3_3_activate_addon.png" alt="Activate add-on" width="750" height="630"/>

### Step 4: Load a PBR Sequence

1. Open the SwitchLight Add-on from the sidebar.

<img src="https://desktop.beeble.ai/public/blender_readme/4_0_click_addon.png" alt="Open add-on" width="750" height="630"/>

<br>
2. Import your desired SwitchLight PBR sequence.

<img src="https://desktop.beeble.ai/public/blender_readme/4_1_import.png" alt="Import PBR" width="750" height="630"/>

<br>
3. The selected directory should contain SwitchLight PBR map folders (i.e., albedo, normal, roughness, and specular).

<br>
<img src="https://desktop.beeble.ai/public/blender_readme/4_2_load_pbr.png" alt="Import PBR" width="750" height="630"/>

<br>
4. Click 'Load PBR Sequence' button.

<br>
<img src="https://desktop.beeble.ai/public/blender_readme/4_3_load_pbr_2.png" alt="Load PBR" width="750" height="630"/>

<br>
5. Then, you will see the newly created SwitchLightPlane, SwitchLightCamera, and SwitchLightPointLight.

<br>
<img src="https://desktop.beeble.ai/public/blender_readme/4_4_load_pbr_3.png" alt="Apply PBR" width="750" height="630"/>

### Step 5: Completion!

1. Confirm the setup by clicking the parts as illustrated.

<br>
<img src="https://desktop.beeble.ai/public/blender_readme/5_0_completion.png" alt="Completion" width="750" height="630"/>


<br><br><br>

You're ready to go!
Experiment with different assets and environments to see how they interact with your imported PBR sequences.
