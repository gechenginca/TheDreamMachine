# TheDreamMachine

## Table of Contents

1. [Project Title](#project_title)
2. [Team Members](#team_members)
3. [Project Description](#project_description)
4. [Beta Version](#beta_version)
5. [Final Version](#final_version)
6. [Technology](#technology)
7. [Technical Challenges](#technical_challenges)

## <a name='project_title'></a>Project Title

### <u>Online Study Tables</u>

## <a name='team_members'></a>Team Members

Cheng Ge, Vladimir Efimov (efimovvl), Andrew Huang

## <a name='project_description'></a>Project Description

There are two parts to the project. First is the ability to find a find and create a study group that fits the user's needs. The second is to have a virtual study session that allows for easy collaboration.

A user is able to create a Profile:

- Name
- Year of Study
- Program
- Current courses
- Finished courses
- University/school

A user is able to create and manage a Study Table:

- Name
- Course
- Location (or virtual)
- Type (discussion, Quiet, Q&A)
- Private/Public
  - Invite members
  - Ask to join group
- Description
- Members
- Meeting Times
- Meeting Topics

On the main page the top will have a search bar for a users to be able to search for a Study Table

- By course id
- Meeting times

Bellow the search option the best matching and active Study Tables will be visually displayed. Clicking on one of the matches will display details of the group and able to join it.

The more difficult and interesting part of the project will be implementing the virtual collaborative Study Table. A virtual Study Table will consist of the following components:

- The white board. A live synced drawing canvas for users to edit collaboratively.
  - Users will be able to free draw, make lines, and drag and drop images.
  - The canvas has coordinates, and its size grows dynamically as needed.
  - There will be numbered tabs for separate white boards, a user will be able to make them as needed.
  - The white board can be saved future use, can be downloaded and uploaded.
- Chat for users to converse in and share files in. There is a separate section for list of files.
- Voice chat, with users voice status (mute, listening, etc.) on the side.

## <a name='beta_version'></a>Beta Version

In the Beta version, the project will implement those main features.

1. white board in the online study table.
   It is the most important part of the project. In Beta version, it need to implement all features in the white board such as it allows users draw, make lines, drag and drop images; size graws dynamically as needed; complex white board as user needed; and the saved future.
2. The features of create and manage the Profile by user.
3. The featuses of create and manage the Study table.

## <a name='final_version'></a>Final Version

for the final version, the project will improve and implement features below.

1. Optimize the features in the Beta version.
2. The feature of search and its visual effects.
3. Writing communication and the files share function.
4. The features of voice chat include the voice status.
5. The securtiy of the project.

## <a name='technology'></a>Technology

1. WebRTC and webSockets are using for Real time synchronization
2. Snap.svg is used for 2D canvas
3. Using AngularJs to build the frontend
4. Browser / Mobile support

## <a name='technical_challenges'></a>Technical Challenges

All the frameworks below are new to our team. They are potentially very helpful to our app.

1. [WebRTC](https://webrtc.org/)
   - Signaling: It is used for coordinating communication and send control messages. Signaling methods and protocols are not specified by WebRTC which needs supports from Socket.IO or other [alternatives](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md).
   - STUN & TURN servers](https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/): Client applications need to traverse [NAT gateways](http://en.wikipedia.org/wiki/NAT_traversal) and firewalls. WebRTC APIs use STUN servers to get the IP address of your computer, and TURN servers to function as relay servers in case peer-to-peer communication fails.
   3. Security: Encryption is mandatory for all WebRTC components, and its JavaScript APIs can only be used from secure origins (HTTPS or localhost). Developers are responsible to use secure protocols for signaling.
   4. Resources
      1. [codelabs](https://codelabs.developers.google.com/codelabs/webrtc-web/#0)
      2. [More Resources](https://webrtc.org/start/)
   5. [PeerJS](http://peerjs.com/): It wraps the browser's WebRTC implementation to provide a complete, configurable, and easy-to-use peer-to-peer connection API. Equipped with nothing but an ID, a peer can create a P2P data or media stream connection to a remote peer.
      1. [Getting Started](http://peerjs.com/docs/#start)
      2. [Examples](http://peerjs.com/examples)
   6. [DataChannelJS](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DataChannel): A JavaScript library useful to write many-to-many i.e. group file/data sharing or text chat applications.
   7. [TogetherJS](https://togetherjs.com/): A free, open source JavaScript library by Mozilla that adds collaboration features and tools to website.
      1. [Sample app: Drawing](https://togetherjs.com/examples/drawing/)
2. [webSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API): WebSockets are an advanced technology that makes it possible to open an interactive communication session between the user's browser and a server. With this API, you can send messages to a server and receive event-driven responses without having to poll the server for a reply.
   - [Socket.IO](https://socket.io/)
3. [Snap.svg](http://snapsvg.io/): SVG is an excellent way to create interactive, resolution-independent vector graphics that will look great on any size screen.
   - [Example](http://snapsvg.io/start/)
   - [Docs](http://snapsvg.io/docs/)
4. Frontend
   - [AngularJS](https://angularjs.org/)
   - [Bootstrap](http://getbootstrap.com/)
5. Browser / Mobile support
   - [Foundation](https://foundation.zurb.com/): A frontend framework supports any kind of device, any size screen, with any resolution.