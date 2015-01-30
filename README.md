# HackTrack2

HackTrack is my first iOS application, which I built using the NativeScript platform (developed by Telerik). It is a proof of concept application intended to be used at hackathons for students to easily store data about their project and view other students' projects. Some future extensions of HackTrack could be to build an application for judges to grade, rank, and leave comments on various projects at a hackathon. In addition, HackTrack could be made into an IoT app, where each team would be given an iBeacon and would enter its UUID during registration. Then, as students and judges move through the hackathon and interact with each other, the app would indicate which teams/hacks are nearby. A third extension could be to create a web view, on which the entire public would be able to see all of the projects at a particular hackathon.

To run this application on your device, please follow the steps below:
<ol>
<li> Make sure you have NativeScript CLI (https://github.com/NativeScript/nativescript-cli) </li>
<li> Clone this repository or download the zip </li>
<li> Follow the instructions in the instructions.txt file to prepare the code </li>
<li> In your command line, run 'tns create HackTrack' in a desired location </li>
<li> Replace the entire inner app folder of the folder you just created with the app folder of this repo </li>
<li> Run 'tns list-devices' in your command line and make sure your phone is recognized </li>
<li> Run 'tns run ios' to prepare, build, and deploy the app to your device </li>
</ol>
