# Socket Events


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
5. `E1005`: User could not be added to the channel. Internal Server Error


## Create Channel:

Event to emit (Client -> Server): `channel:create`

Data: 

```typescript
{
    channelName: string
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
    channelId: string
}
```

Emitted event (Server -> Client): `channel:left`

Data: 
```typescript
{
    channelId: string 
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

## "ActionTypes":
These are the accepted values of the actionType fields:

```typescript
  'Freedraw'
  'Shape'
  'Select'
  'Translate'
  'Rotate'
  'Delete'
  'Resize'
  'Text'
  'Layer'
  'UndoRedo'
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
    color: number // integer,
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
    color: number // integer,
    width: number // float,
}

Possible Errors: 
 
1. `E2001`: Could not trigger action: Freedraw data error on [Error] (The error is dynamically computed)                    
2. `E2002`: Could not trigger the action: Internal Socket Server Error 

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

# Action Saving

The database needs time to save each data, subscribe to `action:saved` to be able to send the rest of the necessary actions regarding an action to the server.

For example, for selecting a line after it's been drawn, you must wait for the `action:saved` signal to send the `select:emit` with the appropriate actionId.

Event emitted (Server -> Client): `action:saved`

Data:

```typescript
{
    actionId: string;
    collaborationId: string;
}