# Socket Events


## Channel Events:  

- Join Channel: 

    Data: 
    ```typescript
    {
        channelId: string
    }
    ```

    Possible errors: 
    
    1. `E0000`: Internal Error.
    2. `E1001`: Channel ID cannot be empty.
    3. `E1002`: Channel ID must only contain valid ASCII symbols. 
    4. `E1003`: Channel was not found in the list of channels.
    5. `E1004`: Channel could not be joined as user is already a member of the channel.