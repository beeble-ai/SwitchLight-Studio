# SwitchLight Studio (No Internet Needed)
<p align="center"><img style="width: 500px;" src="https://desktop.beeble.ai/public/youtube-banner-2.png"></p>

## Usage

SwitchLight Studio is a video relighting AI solution for professionals. <br/>With this app, you can extract material maps (Normal, Albedo, Roughness, and Specular maps) along with alpha from videos and do video relighting. All these features are run on your own GPUs so no data is transmitted externally. 

SwitchLight Studio is currently in its closed beta. If you'd like to try out, please submit the beta application form in our <a href="https://discord.gg/5REz3mzWwj" target="_blank">Discord</a>.

## SwitchLight Add-on For Blender
With a single click, you can import your SwitchLight PBR sequences directly onto a dummy plane, facilitating seamless experimentation within your Blender projects. For more details, please see <a href="https://github.com/beeble-ai/SwitchLight-Studio/blob/main/blender/README.md">README.md</a>

## SwitchLight Python Script For UE
This script automates the import and application of SwitchLight PBR materials in Unreal Engine. Key features include:
- Creation of Img Media Sources, Media textures, and Media players from PBR maps.
- BSDF material setup with integrated color space conversion and normal map processing.
- Level Sequencer setup for rendering 3D scenes and materials using the Movie Render Queue.

For more details, please see <a href="https://github.com/beeble-ai/SwitchLight-Studio/blob/main/unreal_engine/README.md">README.md</a>

## SwitchLight Web
If you'd like to try SwitchLight on still images, no GPU or installations needed, just visit: 
<a href="(https://switchlight.beeble.ai/)" target="_blank"> https://switchlight.beeble.ai/</a>

## SwitchLight API
Relighting & HDRI extraction APIs are now available on <a href="(https://switchlight-api.beeble.ai/)" target="_blank"> https://switchlight-api.beeble.ai/</a> 
Create your own applications that use the same state-of-the-art technology that powers the SwitchLight: From background removal and PBR map extraction to relighting. 

### 1️⃣  Relighting API
Relight your images using HDRI maps.
You can adjust lighting direction and strength, keying method just like web.

### 2️⃣ HDRI extraction API
Extract the lighting source from portrait images, delivered as a 64 x 32 HDRI image in .exr format.
The Extracted HDRI map contains all the necessary information of the surrounding lighting.
Use the HDRI map with our Relighting API to apply the same lighting environment to different images.



