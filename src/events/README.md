# Socket Events


# Channel Events:  

All events can return this error:

`E0000`: Internal Error.



## Join Channel: 

Event to emit (Client -> Server): `channel:join`

Data: 
```typescript
{
    channelId: string
}
```

Event emitted (Server -> Client): `channel:joined`

Data: 
```typescript
{
    channelId: string,
    channelName: string,
    createdAt: string,
    updatedAt: string,
    collaborationId: string
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
5. `E1021`: Could not send message: Internal Socket Server Error.
