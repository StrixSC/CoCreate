import 'package:Colorimage/models/chat.dart';
import 'package:Colorimage/models/user.dart';
import 'package:flutter/material.dart';

import '../../constants/general.dart';

class ChatCard extends StatelessWidget {
  const ChatCard({
    Key? key,
    required this.chat,
    required this.user,
    required this.press,
  }) : super(key: key);

  final Chat chat;
  final User user;
  final VoidCallback press;

  fetchChannelInfo() {

  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: press,
      child: Padding(
        padding: const EdgeInsets.symmetric(
            horizontal: kDefaultPadding, vertical: kDefaultPadding * 0.75),
        child: Row(
          children: [
            Stack(
              children: const [
                CircleAvatar(
                    radius: 24, backgroundColor: kPrimaryColor, child:
                      /*************************** ADD 'nMembers > 1? Group icon : Avatar of only member' ***********************/
                      Icon(Icons.group, color: Colors.black),
                ),
                // if (chat.isActive)
                //   Positioned(
                //     right: 0,
                //     bottom: 0,
                //     child: Container(
                //       height: 16,
                //       width: 16,
                //       decoration: BoxDecoration(
                //         color: Colors.green,
                //         shape: BoxShape.circle,
                //         border: Border.all(
                //             color: Theme.of(context).scaffoldBackgroundColor,
                //             width: 3),
                //       ),
                //     ),
                //   )
              ],
            ),
            Expanded(
              child: Padding(
                padding:
                const EdgeInsets.symmetric(horizontal: kDefaultPadding),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      chat.name,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                    ),
                    SizedBox(height: 8),
                    const Opacity(
                      opacity: 0.64,
                      child: Text(
                        // chat.lastMessage,
                        'last message',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              ),
            ),
              if(chat.name != "Canal Publique" && chat.is_owner)
                IconButton(
                  iconSize: 28,
                  icon: const Icon(Icons.highlight_remove),
                  color: kErrorColor,
                  onPressed: () {
                    print('delete');
                  }),
              // Text(chat.time,
              //   style:
              //     const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),),
          ],
        ),
      ),
    );
  }
}