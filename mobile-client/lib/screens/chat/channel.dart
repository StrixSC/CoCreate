import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/providers/collaborator.dart';
import 'package:Colorimage/providers/messenger.dart';
import 'package:Colorimage/providers/team.dart';
import 'package:awesome_dialog/awesome_dialog.dart';
import 'package:flutter/material.dart';
import 'package:provider/src/provider.dart';
import '../../app.dart';
import '../../models/chat.dart';
import 'chat.dart';
import 'chat_card.dart';
import 'package:adaptive_dialog/adaptive_dialog.dart';
import 'package:select_dialog/select_dialog.dart';

class Channel extends StatefulWidget {
  const Channel({Key? key}) : super(key: key);

  @override
  _ChannelState createState() => _ChannelState();
}

class _ChannelState extends State<Channel> with TickerProviderStateMixin {
  Map<String, String> channelType = {
    'Public': 'Public',
    'Team': 'Team',
    'Collaboration': 'Collaboration'
  };
  String currentSelectedJoin = '';

  late TabController _tabController;
  TabBar get _tabBar => TabBar(
        indicatorWeight: 5.0,
        controller: _tabController,
        onTap: (value) {
          // setState(() {
          //   dropDownValueType = 'Aucun';
          //   searchControllers.update(
          //       TYPES[value], (value) => TextEditingController());
          //   pagingControllers[TYPES[value]].refresh();
          // });
          context.read<Messenger>().tabIndex = value;
        },
        tabs: [
          Tab(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                SizedBox(width: 8),
                Text('Canaux Généraux', style: TextStyle(fontSize: 18)),
              ],
            ),
          ),
          Tab(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                SizedBox(width: 8),
                Text('Canaux des Équipes', style: TextStyle(fontSize: 18)),
              ],
            ),
          ),
        ],
      );

  @override
  void initState() {
    super.initState();
    context.read<Messenger>().setIndex = setIndex;
    _tabController = TabController(length: 2, vsync: this);
  }

  setIndex() {
    setState(() {
      _tabController.animateTo(  context.read<Messenger>().tabIndex);
      _tabController.index = 0;
      _tabController;

    });
  }

  Widget channelListWidgetGeneral() {
    return (Column(children: [
      Column(children: [
        section(channelType['Public']),
        getChannelListWithType(channelType['Public'],
            "Joignez un canal pour discuter avec vos amis! 😄"),
        createJoinButtons(),
      ]),
      isDrawing()
          ? Column(children: [
              section(channelType['Collaboration']),
              getChannelListWithType(channelType['Collaboration'],
                  "Joignez un dessin pour discuter avec vos amis! 😄"),
            ])
          : const SizedBox.shrink(),
    ]));
  }

  Widget channelListWidgetTeam() {
    return (Column(children: [
      Column(children: [
        section(channelType['Team']),
        getChannelListWithType(channelType['Team'],
            "Joignez une équipe pour discuter avec vos amis! 😄"),
      ]),
      isDrawing()
          ? Column(children: [
              section(channelType['Collaboration']),
              getChannelListWithType(channelType['Collaboration'],
                  "Joignez un dessin pour discuter avec vos amis! 😄"),
            ])
          : const SizedBox.shrink(),
    ]));
  }

  bool isDrawing() {
    return context.read<Collaborator>().currentDrawingId != '';
  }

  getChannelListWithType(type, String message) {
    return RefreshIndicator(
        onRefresh: () => Future.sync(
              () {
                context.read<Messenger>().fetchChannels();
              },
            ),
        child: MediaQuery.removePadding(
            context: context,
            removeTop: true,
            child: ConstrainedBox(
                constraints: context.read<Messenger>().userChannels.isEmpty
                    ? const BoxConstraints(minHeight: 5.0, maxHeight: 75.0)
                    : const BoxConstraints(minHeight: 45.0, maxHeight: 420.0),
                child: context.read<Messenger>().userChannels.isEmpty
                    ? Center(
                        child: Text(
                        message,
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w500),
                      ))
                    : listBuilder(type))));
  }

  listBuilder(type) {
    return ListView.builder(
        shrinkWrap: true,
        itemCount: context.read<Messenger>().userChannels.length,
        itemBuilder: (context, index) {
          if (context.read<Messenger>().userChannels[index].type == type) {
            return Column(children: [
              ChatCard(
                  chat: context.watch<Messenger>().userChannels[index],
                  user: context.watch<Messenger>().auth!.user!,
                  press: () {
                    context.read<Messenger>().toggleSelection();
                    context.read<Messenger>().currentSelectedChannelIndex =
                        index;
                    if (context
                        .read<Messenger>()
                        .userChannels[index]
                        .messages
                        .isNotEmpty) {
                      context
                              .read<Messenger>()
                              .userChannels[index]
                              .lastReadMessage =
                          context
                              .read<Messenger>()
                              .userChannels[index]
                              .messages
                              .first
                              .text;
                    }
                  })
            ]); //, Divider(indent: 250.0, endIndent: 250.0, thickness: 1, color: Colors.white.withOpacity(0.3))]);
          } else {
            return const SizedBox.shrink();
          }
        });
  }

  section(type) {
    return Padding(
        padding: const EdgeInsets.only(top: 20.0),
        child: Row(children: <Widget>[
          Expanded(child: Divider(thickness: 2, color: Colors.white)),
          CircleAvatar(
            child: Stack(children: [
              Align(
                alignment: Alignment.bottomRight,
                child: CircleAvatar(
                  radius: 55,
                  backgroundColor: Colors.white70,
                  child: type == channelType['Public']
                      ? Icon(Icons.message)
                      : type == channelType['Collaboration']
                          ? Icon(Icons.brush_sharp)
                          : Icon(Icons.group),
                ),
              ),
            ]),
          ),
          Expanded(child: Divider(thickness: 2, color: Colors.white)),
        ]));
  }

  createJoinButtons() {
    return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          ElevatedButton(
              onPressed: () {
                context.read<Messenger>().getAvailableChannels();
                currentSelectedJoin = '';
                joinChannelDialog(context.read<Messenger>().auth!.user);
              },
              child: const Text(
                'Joindre un canal',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w500),
              )),
          const Padding(padding: EdgeInsets.fromLTRB(0, 0, 20, 0)),
          ElevatedButton(
              onPressed: () {
                createChannelDialog();
              },
              child: const Text(
                'Créer un canal',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w500),
              ))
        ]);
  }

  createChannelDialog() async {
    final text = await showTextInputDialog(
      okLabel: "Créer",
      message: "Veuillez choisir un nom de canal unique.",
      context: context,
      textFields: [
        DialogTextField(validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Veuillez entrez un nom valide';
          }
        }),
      ],
      title: 'Créer un canal',
    );
    if (text != null) {
      context.read<Messenger>().channelSocket.createChannel(text[0]);
    }
  }

  joinChannelDialog(user) async {
    dynamic ex1;
    SelectDialog.showModal<Chat>(
      context,
      label: "Liste des canaux disponibles",
      selectedValue: ex1,
      multipleSelectedValues: ex1,
      items: context.read<Messenger>().availableChannel,
      itemBuilder: (context, item, isSelected) {
        return Container(
            margin: EdgeInsets.only(top: 18.0),
            decoration: currentSelectedJoin == item.id
                ? BoxDecoration(
                    border: Border.all(width: 3.5, color: kPrimaryColor))
                : null,
            child: ChatCard(
                chat: item,
                user: user,
                press: () {
                  setState(() {
                    currentSelectedJoin = item.id;
                  });
                  // context.read<Messenger>().channelSocket.joinChannel(item.id);
                }));
      },
      emptyBuilder: (context) => Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Text('Aucun canal disponible..',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w500))
          ]),
      onMultipleItemsChange: (List<Chat> selected) {
        setState(() {
          ex1 = selected;
        });
      },
      okButtonBuilder: (context, onPressed) {
        return Align(
            alignment: Alignment.centerRight,
            child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    child: Text('Annuler'),
                  ),
                  SizedBox(width: 25.0),
                  context.read<Messenger>().availableChannel.isNotEmpty
                      ? ElevatedButton(
                          onPressed: () {
                            currentSelectedJoin == ''
                                ? AwesomeDialog(
                                    context: navigatorKey.currentContext
                                        as BuildContext,
                                    width: 800,
                                    btnOkColor: Colors.red,
                                    dismissOnTouchOutside: false,
                                    dialogType: DialogType.ERROR,
                                    animType: AnimType.BOTTOMSLIDE,
                                    title: 'Erreur!',
                                    desc:
                                        'Veuillez choisir une chaine pour joindre!',
                                    btnOkOnPress: () {},
                                  ).show()
                                : context
                                    .read<Messenger>()
                                    .channelSocket
                                    .joinChannel(currentSelectedJoin);
                            Navigator.pop(context);
                          },
                          child: Text('Joindre'),
                        )
                      : SizedBox.shrink(),
                ]));
      },
      searchBoxDecoration: InputDecoration(
        errorStyle: const TextStyle(fontSize: 26),
        hintText: "Cherchez un canal par son nom",
        hintStyle: const TextStyle(
          fontSize: 26,
        ),
        contentPadding: const EdgeInsets.all(15),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(0)),
        prefixIcon: const Icon(Icons.search),
      ),
      onChange: (selected) {
        setState(() {
          ex1 = selected;
          currentSelectedJoin = selected.id;
        });
      },
    );
  }

  Widget channelChatWidget() {
    return ChatScreen(context.read<Messenger>().currentSelectedChannelIndex);
  }

  @override
  Widget build(BuildContext context) {
    Messenger messenger = context.watch<Messenger>();
    return Scaffold(
        appBar: !messenger.isChannelSelected
            ? PreferredSize(
            preferredSize: _tabBar.preferredSize,
            child: Column(children: [
              const SizedBox(height: 20.0),
              ColoredBox(color: kContentColor, child: _tabBar)
            ])): null,
        body: Column(key: const PageStorageKey("channels"), children: [
          messenger.isChannelSelected
              ? Expanded(child: channelChatWidget())
              : Expanded(
                  child: TabBarView(
                  physics: const NeverScrollableScrollPhysics(),
                  controller: _tabController,
                  children: [
                    SingleChildScrollView(
                        child: Container(
                            child: Column(
                              children: [
                                channelListWidgetGeneral(),
                              ],
                            ))),
                    SingleChildScrollView(
                        child: Column(
                      children: [
                        channelListWidgetTeam(),
                      ],
                    )),
                  ],
                ))
        ]));
  }
}
