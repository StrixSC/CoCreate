# Socket Events

## Disconnection:

Upon user disconnection, the socket server will send the `user:disconnection` event to all rooms that the user is currently in. This can be used to set the offline or online status to users when in the chatrooms or in the collaboration sessions.

<br>

# Channel Events:

All events can return this error:

`E0000`: Internal Error.

## Join Channel:

Event to emit (Client -> Server): `channel:join`

Data:

```typescript
{
    channelId: string,
}
```

Event emitted (Server -> Client): `channel:joined`

Data:

```typescript
{
    channelId: string,
    channelName: string,
    collaborationId: string,
}
```

Possible errors:

1. `E1001`: Channel ID cannot be empty.
2. `E1002`: Channel ID must only contain valid ASCII symbols.
3. `E1003`: Channel was not found in the list of channels.
4. `E1005`: User could not be added to the channel. Internal Server Error

## Create Channel:

Event to emit (Client -> Server): `channel:create`

Data:

```typescript
{
    channelName: string;
}
```

Emitted event (Server -> Client): `channel:created`

Data:

```typescript
{
    channelId: string,
    channelName: string,
    createdAt: string,
    updatedAt: string,
    ownerUsername: string,
    collaborationId: string
}
```

Possible Errors:

1. `E1006`: Channel name must be between 4 and 255 characters
2. `E1007`: Channel name must only contain valid ASCII symbols
3. `E1008`: Channel could not be created: Internal Socket Server Error

## Leave Channel:

Event to emit (Client -> Server): `channel:leave`

Data:

```typescript
{
    channelId: string;
}
```

Emitted event (Server -> Client): `channel:left`

Data:

```typescript
{
    channelId: string;
}
```

Possible Errors:

1. `E1001`: Channel ID cannot be empty.
2. `E1002`: Channel ID must only contain valid ASCII symbols.
3. `E1009`: User is not a member of the channel.
4. `E1010`: Could not leave channel: User is channel owner. Channel must be deleted if user wants to leave.

## Channel Update

Event to emit (Client -> Socket): `channel:update`

Data:

```typescript
{
    channelId: string,
    channelName: string
}
```

Event emitted (Server -> Client): `channel:updated`

Data:

```typescript
{
    channelId: string,
    channelName: string,
    updatedAt: Date | string,
}
```

Possible Errors:

1. `E1006`: Channel name must be between 4 and 255 characters
2. `E1007`: Channel name must only contain valid ASCII symbols
3. `E1010`: Could not update channel: User is not a member of this channel.
4. `E1011`: Could not update channel: User is not the owner of this channel.
5. `E1012`: Could not update channel: Channel Name is already taken.
6. `E1013`: Could not update channel: Internal socket server error.

## Channel Delete

Event to emit (Client -> Socket): `channel:delete`

Data:

```typescript
{
    channelId: string,
}
```

Event emitted (Server -> Client): `channel:deleted`

Data:

```typescript
{
    channelId: string,
}
```

Possible Errors:

1. `E1001`: Channel ID cannot be empty.
2. `E1002`: Channel ID must only contain valid ASCII symbols.
3. `E1015`: Could not delete channel: Channel does not exist or user is not a member of this channel.
4. `E1016`: Could not delete channel: User is not the owner of this channel.
5. `E1017`: Could not delete channel: Internal socket server error.

## Send Message

Event to emit (Client -> Socket): `channel:send`

Data:

```typescript
{
    channelId: string,
    message: string
}
```

Event emitted (Server -> Client): `channel:sent`

Data:

```typescript
{
    channelId: string,
    message: string,
    messageId: dbMessage.message_id,
    createdAt: Date | string,
    username: string,
    avatarUrl: string,
}
```

Possible Errors:

1. `E1001`: Channel ID cannot be empty.
2. `E1002`: Channel ID must only contain valid ASCII symbols.
3. `E1018`: Message must be between 1 and 256 characters.
4. `E1019`: Could not send message: Channel ID does not match any existing channels.
5. `E1020`: Could not send message: The user is not a part of the channel.
6. `E1021`: Could not send message: Internal Socket Server Error.

# Drawing Events:

Possible events:

```typescript
 Client Emits          Server Emits
'freedraw:emit'    -> 'freedraw:received'
'shape:emit'       -> 'shape:received'
'selection:emit'   -> 'selection:received'
'rotation:emit'    -> 'rotation:received'
'resize:emit'      -> 'resize:received'
'translation:emit' -> 'translation:received'
'delete:emit'      -> 'delete:received'
'undoredo:emit'    -> 'undoredo:received'
'text:emit'        -> 'text:received'
'layer:emit'       -> 'layer:received'
```

## "ActionTypes":

These are the accepted values of the actionType fields:

```typescript
'Freedraw';
'Shape';
'Select';
'Translate';
'Rotate';
'Delete';
'Resize';
'Text';
'Layer';
'UndoRedo';
```

## Freedraw

Event to emit (Client -> Socket): `freedraw:emit`

Data:

These values are necessary when the actions are in state "down" or "move":

```typescript
{
    actionId: string,
    username: string,
    userId: string,
    collaborationId: string,
    actionType: string,
    state: string,
    isSelected: boolean,
    x: number // float,
    y: number // float,
    r: number // integer,
    g: number // integer,
    b: number // integer,
    a: number // integer,
    width: number // float,
}
```

These values are necessary when the actions are in state "up":

```typescript
{
    actionId: string,
    username: string,
    userId: string,
    collaborationId: string,
    actionType: string,
    state: string,
    isSelected: boolean,
    r: number, // integer
    g: number, // integer
    b: number, // integer
    a: number, // integer,
    offsets: {x: number, y: number}[], // x and y can be either floats or integers.
    width: number // float,
}

```

The offsets value is the list of x and y coords sent to the server. These are used to store the actions in the database. These offsets should be used to draw the full action on the screen when received from the server. They will also be given to the new users that join a drawing to render the drawing on the screen.

Event emitted (Server -> Client): `freedraw:received`

Data:

These values are received from the server in state "down" or "move":

```typescript
{
    actionId: string,
    username: string,
    userId: string,
    collaborationId: string,
    actionType: string,
    state: string, // move/down/up
    isSelected: boolean,
    x: number // float,
    y: number // float,
    r: number // integer,
    g: number // integer,
    b: number // integer,
    a: number // integer,
    width: number // float,
}
```

These values should be sent from the server when the actions are in state "up":

```typescript
{
    actionId: string,
    username: string,
    userId: string,
    collaborationId: string,
    actionType: string,
    state: string, // move/down/up
    isSelected: boolean,
    r: number, // integer | float
    g: number, // integer | float
    b: number, // integer | float
    a: number, // integer | float
    offsets: {x: number, y: number}[], // x and y can be either floats or integers.
    width: number // float,
}
```

Possible Errors:

1. `E2001`: Could not trigger action: Freedraw data error on [Error] (The error is dynamically computed)
2. `E2002`: Could not trigger the action: Internal Socket Server Error

## Shape

Event to emit (Client -> Socket): `shape:emit`

Data:

These values are necessary when the actions are in state "down" or "move":

```typescript
{
actionId: string,
    username: string,
    userId: string,
    collaborationId: string,
    actionType: string,
    state: string, // move/down/up
    isSelected: boolean,
    x: number // integer/float,
    y: number // integer/float,
    r: number // integer,
    g: number // integer,
    b: number // integer,
    a: number // integer,
    x2: number // integer/float,
    y2: number // integer/float,
    rFill: number // integer,
    gFill: number // integer,
    bFill: number // integer,
    aFill: number // integer,
    width: number // float,
    shapeType: string // Rectangle | Ellipse | Null
    shapeStyle: string // border | fill | center
}
```

Event emitted (Server -> Client): `shape:received`

Data:

These values are received from the server in state "down" or "move":

```typescript
{
    actionId: string,
    username: string,
    userId: string,
    collaborationId: string,
    actionType: string,
    state: string, // move/down/up
    isSelected: boolean,
    x: number // integer/float,
    y: number // integer/float,
    r: number // integer,
    g: number // integer,
    b: number // integer,
    a: number // integer,
    x2: number // integer/float,
    y2: number // integer/float,
    rFill: number // integer,
    gFill: number // integer,
    bFill: number // integer,
    aFill: number // integer,
    width: number // float,
    shapeType: string // Rectangle | Ellipse | Null
    shapeStyle: string // fill | center | border
}
```

Possible Errors: TODO

## Selection

Event to emit (Client -> Socket): `selection:emit`

Data:

```typescript
{
    actionId: string,
    username: string,
    userId: string,
    collaborationId: string,
    actionType: string,
    isSelected: boolean,    // Whether to select or unselect the action.
}
```

Event emitted (Server -> Client): `selection:received`

Data:

```typescript
{
    actionId: string,
    isSelected: boolean,
    selectedBy: string // The userId of the user that selected the action.
}
```

Possible Errors:

1. `E2201`: Could not trigger action: Selection data error on: [Error] (The error is computed dynamically)
2. `E2202`: Could not trigger action: Action could not be found in the database
3. `E2203`: Could not trigger action: The action is already selected by a different user.
4. `E2204`: Could not trigger action. Either the isSelected value does not differ from the one currently applied or there was an unexpected socket server error.

## Translation

Event to emit (Client -> Socket): `translation:emit`

Data:

```typescript
{
    actionId: string,
    username: string,
    userId: string,
    collaborationId: string,
    actionType: string,
    selectedActionId: string,
    xTranslation: number,   // float
    yTranslation: number    // float
}
```

Event emitted (Server -> Client): `translation:received`

Data:

```typescript
{
    actionId: string,
    isSelected: boolean,
    selectedActionId: string,
    selectedBy: string // The userId of the user that selected the action.
}
```

Possible Errors: TODO

## Rotation

## Delete

## Resize

## Text

## Layers

## UndoRedo

Event to emit (Client -> Socket): `undoredo:emit`

Data:

```typescript
{
    actionId: string,
    username: string,
    userId: string,
    collaborationId: string,
    actionType: string,
    isUndo: boolean // Set to true for undo action, otherwise false for redo action.
}
```

Event emitted (Server -> Client): `undoredo:received`

Data:

```typescript
{
    actionId: string, // Action to undo
    isUndo: boolean,
    userId: string, // UserId of the user that undoed the action
}
```

Possible Errors:
TODO

## Action Saving

The database needs time to save each data, subscribe to `action:saved` to be able to send the rest of the necessary actions regarding an action to the server.

For example, for selecting a line after it's been drawn, you must wait for the `action:saved` signal to send the `select:emit` with the appropriate actionId.

Event emitted (Server -> Client): `action:saved`

Data:

```typescript
{
    actionId: string;
    collaborationId: string;
}
```

# Collaboration Events

## Join Collaboration

#### Use this route to join a collaboration for the first time. The next times you want to connect to the collaboration, use the "Connect" events instead.

Client -> Server : `collaboration:join`

Two events will be triggered back (Server -> Clients):

1. `collaboration:load` : Sent to the user that triggered the event **USE THIS EVENT TO SWITCH THE VIEW TO THE DRAWING VIEW and start loading the drawing**
2. `collaboration:joined` : Sent to all the users, use this to update the active members on the gallery for the given collaboration_id

Payload to send:

```typescript
{
	userId: string,
	collaborationId: string,
	type: string,	// "Protected", "Public" or "Private"
	password?: string // Mandatory if the type is "Protected"
}
```

Response sent with `collaboration:load`:

```typescript
{
	actions: Action[], *
	memberCount: number,
	maxMemberCount: number,
	title: string,
	authorUsername: string,
	authorAvatar: string,
	members: Array<{ username: string, avatarUrl: string }>,
	backgroundColor: string, // Hex value of the background color (Defaults to #FFFFFF)
	width: number,	// Width of the drawing (Defaults to 1280)
	height: number // Height of the drawing (Defaults to 752)
}
```

-   View [here](https://gitlab.com/polytechnique-montr-al/log3900/21-3/equipe-109/colorimage-server/-/blob/main/prisma/schema.prisma#L114) for the list of attributes of the Action interface.

Response sent with `collaboration:joined`:

```typescript
{
	userId: string, // User Id of the new collaborator
	username: string // Username of the new collaborator
	avatarUrl: string // Avatar of the new collaborator
    collaborationId: stirng // Collaboration/Drawing that was joined.
}
```

## Connect to collaboration

#### Use this event to connect to an already joined collaboration:

Client -> Server : `collaboration:connect`

1. Server -> Client: `collaboration:load` (This is only sent to the user that sent the initial request)
2. Server -> Client: `collaboratoin:connected` (This is only sent to the users that are already loaded in the collaboration/drawing)

Payload to send:

```typescript
{
	userId: string,
	collaborationId: string,
}
```

Response sent with `collaboration:load`:

```typescript
{
	actions: Action[], *
	memberCount: number,
	maxMemberCount: number,
	title: string,
	authorUsername: string,
	authorAvatar: string,
	members: Array<{ username: string, avatarUrl: string }>,
	backgroundColor: string, // Hex value of the background color (Defaults to #FFFFFF)
	width: number,	// Width of the drawing (Defaults to 1280)
	height: number // Height of the drawing (Defaults to 752)
}
```

-   View [here](https://gitlab.com/polytechnique-montr-al/log3900/21-3/equipe-109/colorimage-server/-/blob/main/prisma/schema.prisma#L114) for the list of attributes of the Action interface.

Response sent with `collaboration:connected`:

```typescript
{
	userId: string,		// user id of the member that connected
	username: string,	// Username of the member that connected
	avatarUrl: string,	// Avatar of the member that connected
	type: string		// Type of the member that connected ("Owner"/"Member")
}
```

## Create Collaboration

Use this in the Gallery to create a new drawing.

Client -> Server: `collaboration:create`
Server -> Client: `collaboration:created`

If a password is given, it must be:

-   Between 4 and 256 characters
-   Alphanumeric (No symbols)
-   Non-empty

Payload to send:

```typescript
{
	userId: string,
	title: string,
	type: string, 		// "Protected" or "Public" or "Private"
	password?: string 	// Mandatory if the type is "Protected"
}
```

Response sent:

```typescript
{
    collaborationId: string,
    title: string,
    thumbnailUrl: string,
    type: string, // Private, Protected or Public
    currentCollaboratorCount: number,
    maxCollaboratorCount: number,
    updatedAt: string,
    drawingId: string,
    createdAt: string,
    authorUsername: string,
    authorAvatarUrl: string
}
```

## Update collaboration

Use this in the gallery to update a created drawing. The user must be the owner of the drawing.

Client -> Server: `collaboration:update`
Server -> Client: `collaboration:updated`

If a password is given, it must be:

-   Between 4 and 256 characters
-   Alphanumeric (No symbols)
-   Non-empty

Payload to send:

```typescript
{
	userId: string,
	collaborationId: string,
	title: string,
	type: string, 		// "Protected" or "Public" or "Private"
	password?: string 	// Mandatory if the type is "Protected"
}
```

Response sent:

```typescript
{
    collaborationId: string,
    title: string,
    thumbnailUrl: string,
    type: string, // Private, Protected or Public
    currentCollaboratorCount: number,
    maxCollaboratorCount: number,
    updatedAt: string,
    drawingId: string,
    createdAt: string,
    authorUsername: string,
    authorAvatarUrl: string
}
```

## Delete Collaboration/drawing

Use this to delete the drawing/collaboration. This could be done from the gallery or from the drawing view itself. The deleting user must be the owner.

Client -> Server: `collaboration:delete`
Server -> Client: `collaboration:deleted`

Payload to send:

```typescript
{
	userId: string,
	collaborationId: string
}
```

Response sent:

```typescript
{
	collaborationId: string,
	deletedAt: string // ISO Format
}
```

## Leave collaboration

Use this when a member wishes to leave a drawing collaboration. This is not the event that is used to disconnect a user. This will remove the drawing from the list of drawings of the user. The user must not be the owner and the drawing must not be private.

Client -> Server: `collaboration:leave`
Server -> Client: `collaboration:left`

Payload to send:

```typescript
{
	collaborationId: string,
	userId: string
}
```

Response sent:

```typescript
{
	collaborationId: string,
	userId: string,
	username: string,
	avatarUrl: string,
	leftAt: string, // ISO Format date
}
```
