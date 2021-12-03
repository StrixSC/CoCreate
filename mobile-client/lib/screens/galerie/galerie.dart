import 'dart:async';
import 'dart:convert';
import 'dart:ui';
import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/models/collaboration.dart';
import 'package:Colorimage/models/drawing.dart';
import 'package:Colorimage/providers/collaborator.dart';
import 'package:Colorimage/providers/messenger.dart';
import 'package:Colorimage/screens/drawing/drawing.dart';
import 'package:Colorimage/utils/rest/rest_api.dart';
import 'package:Colorimage/widgets/sidebar.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:http/src/response.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'package:persistent_bottom_nav_bar/persistent-tab-view.dart';
import 'package:provider/src/provider.dart';
import 'package:intl/intl.dart';

import '../../app.dart';

const _fontSize = 20.0;
const padding = 30.0;
const TYPES = ["Available", "Joined"];
final _formKey = GlobalKey<FormBuilderState>();

TextEditingController titreController = TextEditingController();
TextEditingController passController = TextEditingController();
TextEditingController memberController = TextEditingController();

class Galerie extends StatefulWidget {
  @override
  GalerieState createState() => GalerieState();
}

class GalerieState extends State<Galerie>
    with TickerProviderStateMixin, AutomaticKeepAliveClientMixin {
  Map pagingControllers = <String, PagingController<int, Drawing>>{};
  Map searchControllers = <String, TextEditingController>{};
  Map scrollControllers = <String, ScrollController>{};
  Map dropDownControllers = <String, String>{};
  late TabController _tabController;
  static const _pageSize = 12;

  static String dropDownValueTypeCreate = 'Public';
  static String dropDownValueAuthor = 'Moi';
  static String dropDownValueType = 'Aucun';
  Color color = Colors.white;

  GalerieState() {
    for (var type in TYPES) {
      pagingControllers.putIfAbsent(
          type, () => PagingController<int, Drawing>(firstPageKey: 0));
      searchControllers.putIfAbsent(type, () => TextEditingController());
      scrollControllers.putIfAbsent(type, () => ScrollController());
      dropDownControllers.putIfAbsent(type, () => 'Aucun');
    }
  }

  @override
  void initState() {
    super.initState();
    context.read<Collaborator>().pagingControllers = pagingControllers;
    context.read<Collaborator>().navigate = _onLoading;
    _tabController = TabController(length: 2, vsync: this);
    pagingControllers.forEach((key, value) {
      value.addPageRequestListener((pageKey) {
        _fetchDrawings(pageKey, key, dropDownValueType);
      });
      value.addStatusListener((status) {
        if (status == PagingStatus.completed) {
          // ScaffoldMessenger.of(context).clearSnackBars();
          // ScaffoldMessenger.of(context).showSnackBar(
          //   SnackBar(
          //     content: const Text(
          //       "Il n'y a plus de dessins disponibles",
          //     ),
          //     action: SnackBarAction(
          //       label: 'Ok',
          //       onPressed: () {},
          //     ),
          //   ),
          // );
        }
      });
    });
    // Setup the listener.
    scrollControllers.forEach((key, value) {
      value.addListener(() {
        if (value.position.atEdge) {
          if (value.position.pixels == 0) {
            // You're at the top.
          } else {
            // You're at the bottom.
            String section = context.read<Collaborator>().currentType;
            var pageKey = (pagingControllers[section] as PagingController)
                .itemList!
                .length;
            _fetchDrawings(pageKey, section,
                dropDownControllers[context.read<Collaborator>().currentType]);
          }
        }
      });
    });
  }

  navigateToDrawing() {
    var user = context.read<Collaborator>().auth!.user!;
    var socket = context.read<Collaborator>().collaborationSocket.socket;
    var collaborationId = context.read<Collaborator>().getCollaborationId();
    // TODO : wait for load, then navigate to screen
    var actions = context.read<Collaborator>().getCurrentActionMap();
    pushNewScreen(
      context,
      screen: DrawingScreen(socket, user, collaborationId, actions),
      withNavBar: false,
      pageTransitionAnimation: PageTransitionAnimation.cupertino,
    );
  }

  void _onLoading() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return SizedBox(
            height: 150,
            child: Dialog(
              child: Padding(
                  padding: const EdgeInsets.all(25.0),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      CircularProgressIndicator(),
                      SizedBox(
                        width: 20,
                      ),
                      Text("Chargement..."),
                    ],
                  )),
            ));
      },
    );
    Future.delayed(const Duration(seconds: 2), () {
      navigateToDrawing();
      // Navigator.pop(context);
    });
  }

  Future<void> _fetchDrawings(int pageKey, String section, String? type) async {
    RestApi rest = RestApi();
    type = dropDownControllers[context.read<Collaborator>().currentType];
    type = (context.read<Collaborator>().convertToEnglish(type));
    String? filter = (searchControllers[section] as TextEditingController).text;
    if (type == 'Aucun') {
      type = null;
    }
    if (filter.isEmpty) {
      filter = null;
    }
    Response response;
    if (section == 'Available' && type != 'Private') {
      response =
          await rest.drawing.fetchDrawings(filter, pageKey, _pageSize, type);
    } else {
      response = await rest.drawing
          .fetchUserDrawings(filter, pageKey, _pageSize, type);
    }

    if (response.statusCode == 200) {
      var jsonResponse = json.decode(response.body); //Map<String, dynamic>;
      List<Drawing> drawings = [];
      var resp = jsonResponse['drawings'];
      for (var drawing in resp) {
        if (drawing != null) {
          Collaboration collaboration = Collaboration(
            collaborationId: drawing["collaboration_id"],
            memberCount: drawing["collaborator_count"],
            members: [],
            actionsMap: {},
            actions: [],
          );
          // TODO: add updated_at
          drawings.add(Drawing(
            drawingId: drawing['drawing_id'],
            authorUsername: drawing["author_username"],
            authorAvatar: drawing["author_avatar"],
            title: drawing['title'],
            createdAt: DateFormat('yyyy-MM-dd kk:mm')
                .format(DateTime.parse(drawing['created_at'])),
            collaboration: collaboration,
            type: drawing['type'],
            // thumbnailUrl: drawing['thumbnail_url']
          ));
        }
      }
      final isLastPage = drawings.length < _pageSize;
      if (isLastPage) {
        pagingControllers[section].appendLastPage(drawings);
      } else {
        final nextPageKey = pageKey + drawings.length;
        pagingControllers[section].appendPage(drawings, nextPageKey);
      }
      context.read<Collaborator>().addDrawings(drawings);
    } else if (response.statusCode == 204) {
      pagingControllers[section].itemsList = [];
      throw("Theres was a problem in the fetching of drawings...");
    } else {
      pagingControllers[section].itemsList = [];
    }
  }

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
          scrollControllers[TYPES[value]] = ScrollController();
          // TODO: uncomment this line if you want to reload on tab change
          // pagingControllers[TYPES[value]].refresh();
          context.read<Collaborator>().setCurrentType(TYPES[value]);
        },
        tabs: [
          Tab(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                Icon(Icons.public),
                SizedBox(width: 8),
                Text('Dessins Disponibles', style: TextStyle(fontSize: 18)),
              ],
            ),
          ),
          Tab(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                Icon(Icons.adb_sharp),
                SizedBox(width: 8),
                Text('Mes Dessins', style: TextStyle(fontSize: 18)),
              ],
            ),
          ),
        ],
      );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        key: const Key('Gallery'),
        resizeToAvoidBottomInset: false,
        appBar: AppBar(
            backgroundColor: kPrimaryColor,
            centerTitle: true,
            automaticallyImplyLeading: false,
            leading: Builder(
              builder: (context) => // Ensure Scaffold is in context
                  IconButton(
                      icon: Icon(Icons.message),
                      onPressed: () => Scaffold.of(context).openEndDrawer()),
            ),
            title: const Text("Galerie de dessins"),
            actions: <Widget>[
              IconButton(
                  icon: const Icon(CupertinoIcons.plus,
                      color: Colors.white, size: 34),
                  onPressed: () {
                    titreController.clear();
                    passController.clear();
                    memberController.clear();
                    color = Colors.white;
                    createDessinDialog();
                  })
            ],
            bottom: PreferredSize(
                preferredSize: _tabBar.preferredSize,
                child: ColoredBox(color: kContentColor, child: _tabBar))),
        body: TabBarView(
            physics: const NeverScrollableScrollPhysics(),
            controller: _tabController,
            children: [
              gallerieView(pagingControllers["Available"],
                  searchControllers["Available"]),
              gallerieView(
                  pagingControllers["Joined"], searchControllers["Joined"]),
            ]));
  }

  gallerieView(pagingController, searchController) {
    return StatefulBuilder(
        builder: (BuildContext context, StateSetter setState) {
      return Column(children: <Widget>[
        const SizedBox(height: 40.0),
        SizedBox(
            width: MediaQuery.of(context).size.width -
                MediaQuery.of(context).size.width / 4,
            child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  SizedBox(
                      width: MediaQuery.of(context).size.width / 3,
                      child: TextField(
                        style: const TextStyle(fontSize: 25),
                        controller: searchController,
                        onChanged: (text) {
                          String type =
                              context.read<Collaborator>().currentType;
                          pagingControllers[type].refresh();
                          setState(() {
                            pagingControllers;
                          });
                        },
                        maxLines: 1,
                        decoration: InputDecoration(
                          errorStyle: const TextStyle(fontSize: 26),
                          hintText: "Filtrer selon un attribut",
                          hintStyle: const TextStyle(
                            fontSize: 26,
                          ),
                          contentPadding: const EdgeInsets.all(15),
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(0)),
                          prefixIcon: const Icon(Icons.search),
                        ),
                        enableSuggestions: false,
                        autocorrect: false,
                        autofocus: false,
                      )),
                  // const SizedBox(width: 24.0),
                  SizedBox(
                      width: MediaQuery.of(context).size.width / 3,
                      child: dropDown(
                          ['Aucun', 'Public', 'Protégé', 'Privée'],
                          dropDownControllers[
                              context.watch<Collaborator>().currentType],
                          'Filtrer selon un type de dessins',
                          'gallery'))
                ])),
        const SizedBox(height: 40.0),
        Expanded(child: OrientationBuilder(builder: (context, orientation) {
          return RefreshIndicator(
              onRefresh: () => Future.sync(
                    () {
                      String type = context.read<Collaborator>().currentType;
                      pagingControllers[type].refresh();
                    },
                  ),
              child: PagedGridView<int, Drawing>(
                physics: AlwaysScrollableScrollPhysics(),
                showNewPageProgressIndicatorAsGridChild: false,
                showNewPageErrorIndicatorAsGridChild: false,
                showNoMoreItemsIndicatorAsGridChild: false,
                scrollController:
                    scrollControllers[context.read<Collaborator>().currentType],
                pagingController: pagingController,
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  childAspectRatio: (270.0 / 220.0),
                  crossAxisCount: orientation == Orientation.portrait ? 2 : 3,
                  mainAxisSpacing: 18,
                  crossAxisSpacing: 5,
                ),
                builderDelegate: PagedChildBuilderDelegate<Drawing>(
                  animateTransitions: true,
                  // [transitionDuration] has a default value of 250 milliseconds.
                  transitionDuration: const Duration(milliseconds: 500),
                  noItemsFoundIndicatorBuilder: (context) =>
                      context.watch<Collaborator>().currentType == 'Available'
                          ? Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: const [
                                  Center(
                                      child: Text('🧐',
                                          style: TextStyle(fontSize: 50))),
                                  SizedBox(height: 24.0),
                                  Center(
                                      child: Text(
                                          'Aucun dessin disponible. Veuillez en créer un.'))
                                ])
                          : Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: const [
                                  Center(
                                      child: Text('😭',
                                          style: TextStyle(fontSize: 50))),
                                  SizedBox(height: 24.0),
                                  Center(
                                      child: Text(
                                          'Vous faites partie de aucun dessin.'))
                                ]),
                  itemBuilder: (context, item, index) => _Drawing(
                    drawing: item,
                  ),
                ),
              ));
        }))
      ]);
    });
  }

  @override
  void dispose() {
    pagingControllers.forEach((key, value) {
      value.dispose();
    });
    super.dispose();
  }

  @override
  bool get wantKeepAlive => true;

  createDessinDialog() async {
    showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
              titlePadding: EdgeInsets.zero,
              title: Container(
                  padding: EdgeInsets.all(10.0),
                  color: kContentColor,
                  child: Center(child: Text('Créer un dessin'))),
              content: Column(children: [
                Expanded(
                    child: SizedBox(
                        width: 1000,
                        height: 700,
                        child: ListView(
                            shrinkWrap: true,
                            padding: const EdgeInsets.only(
                                left: 100.0, right: 100.0),
                            children: <Widget>[
                              FormBuilder(
                                  key: _formKey,
                                  child: Column(children: <Widget>[
                                    const SizedBox(height: 28.0),
                                    SizedBox(
                                        width: 900,
                                        child: Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceBetween,
                                            children: [
                                              SizedBox(
                                                width: 280,
                                                child: dropDown([
                                                  'Public',
                                                  'Protégé',
                                                  'Privée'
                                                ],
                                                    dropDownValueTypeCreate,
                                                    'Choisir un type de dessins',
                                                    'Type'),
                                              ),
                                              // const SizedBox(width: 24.0),
                                              SizedBox(
                                                  width: 280,
                                                  child: dropDown(
                                                      ['Moi', 'Équipe'],
                                                      dropDownValueAuthor,
                                                      'Choisir un auteur',
                                                      'Auteur')),
                                              SizedBox(
                                                  width: 180,
                                                  child: colorPicker())
                                            ])),
                                    const SizedBox(height: 48.0),
                                    dropDownValueTypeCreate == 'Protégé'
                                        ? SizedBox(
                                            width: 900.0,
                                            child: Row(
                                                mainAxisAlignment:
                                                    MainAxisAlignment
                                                        .spaceBetween,
                                                children: [
                                                  SizedBox(
                                                    width: 375,
                                                    child: formField(
                                                        'Titre',
                                                        'Veuillez entrez le titre du dessin',
                                                        titreController),
                                                  ),
                                                  // const SizedBox(width: 24.0),
                                                  SizedBox(
                                                      width: 375,
                                                      child: formField(
                                                          'Nombre de membres maximum',
                                                          'Veuillez entrez choisir un auteur',
                                                          memberController))
                                                ]))
                                        : formField(
                                            'Titre',
                                            'Veuillez entrez le titre du dessin',
                                            titreController),
                                    const SizedBox(height: 48.0),
                                    dropDownValueTypeCreate == 'Protégé'
                                        ? formField(
                                            'Mot de passe',
                                            'Veuillez entrez choisir un mot de passe',
                                            passController)
                                        : formField(
                                            'Nombre de membres maximum',
                                            'Veuillez entrez choisir un auteur',
                                            memberController),
                                  ]))
                            ])))
              ]),
              actions: <Widget>[
                Padding(
                    padding: EdgeInsets.fromLTRB(0, 0, 25.0, 20.0),
                    child: Container(
                        height: 50,
                        child: ElevatedButton(
                          onPressed: () {
                            _formKey.currentState!.save();
                            if (_formKey.currentState!.validate()) {
                              var type = context
                                  .read<Collaborator>()
                                  .convertToEnglish(dropDownValueTypeCreate);
                              // TODO: Change to take teams into consideration
                              var authorId;
                              dropDownValueAuthor == 'Moi'
                                  ? authorId = context
                                      .read<Collaborator>()
                                      .auth!
                                      .user!
                                      .uid
                                  : authorId = 123;
                              var title = titreController.value.text;
                              var password = passController.value.text;
                              if (type == 'Protected') {
                                context
                                    .read<Collaborator>()
                                    .collaborationSocket
                                    .createCollaboration(
                                        authorId, title, type, password, color);
                              }
                              {
                                context
                                    .read<Collaborator>()
                                    .collaborationSocket
                                    .createCollaboration(
                                        authorId, title, type, null, color);
                              }
                              Navigator.of(context).pop();
                              showDialog<String>(
                                  context: context,
                                  builder: (BuildContext context) =>
                                      AlertDialog(
                                        title: Text(
                                            'Bravo! Votre dessin à été créer avec succès.'),
                                        content: const Text('Amusez-vous! 😄'),
                                        actions: <Widget>[
                                          TextButton(
                                            onPressed: () {
                                              Navigator.pop(context, 'Ok');
                                            },
                                            child: const Text('Ok'),
                                          ),
                                        ],
                                      ));
                            } else {
                              print("validation failed");
                            }
                          },
                          child: const Text('Créer'),
                        ))),
              ],
            ));
  }

  colorPicker() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 15, 0, 15),
      child: ElevatedButton(
        onPressed: () {
          showDialog(
            context: context,
            builder: (BuildContext context) {
              return AlertDialog(
                content: SingleChildScrollView(
                  child: Column(children: [
                    const Text('Choisir une couleur de fond',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 20.0),
                    ColorPicker(
                      pickerColor: color,
                      onColorChanged: (pickerColor) {
                        color = pickerColor;
                      },
                      showLabel: true,
                      pickerAreaHeightPercent: 0.4,
                      colorPickerWidth: 500,
                      pickerAreaBorderRadius:
                          const BorderRadius.all(Radius.circular(15.0)),
                    ),
                  ]),
                ),
                actions: <Widget>[
                  TextButton(
                    onPressed: () {
                      Navigator.pop(context, 'Choisir');
                    },
                    child: const Text('Choisir'),
                  ),
                ],
              );
            },
          );
        },
        child: const Text(
          'Couleur de fond',
          style: TextStyle(fontSize: 15),
          textAlign: TextAlign.center,
        ),
        style: ButtonStyle(
          fixedSize: MaterialStateProperty.all(Size(80, 57)),
          backgroundColor: MaterialStateProperty.all(color),
          foregroundColor: MaterialStateProperty.all(useWhiteForeground(color)
              ? const Color(0xffffffff)
              : const Color(0xff000000)),
        ),
      ),
    );
  }

  dropDown(List<String> items, value, inputHint, String location) {
    return Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
      DropdownButtonFormField<String>(
        value: value,
        decoration: InputDecoration(
          labelText: inputHint,
          labelStyle: const TextStyle(fontSize: _fontSize),
          border: const OutlineInputBorder(
              borderRadius: BorderRadius.all(Radius.zero)),
        ),
        icon: const Align(
            alignment: Alignment.topRight,
            child: Icon(Icons.arrow_downward, size: 35.0)),
        onChanged: (String? newValue) {
          if (location == 'gallery') {
            setState(() {
              dropDownControllers.update(
                  context.read<Collaborator>().currentType,
                  (value) => newValue!);
              pagingControllers[context.read<Collaborator>().currentType]
                  .refresh();
            });
          } else if (location == 'Auteur') {
            setState(() {
              dropDownValueAuthor = newValue!;
            });
          } else if (location == 'Type') {
            setState(() {
              dropDownValueTypeCreate = newValue!;
            });
          }
        },
        items: items.map<DropdownMenuItem<String>>((String value) {
          return DropdownMenuItem<String>(
            value: value,
            child: Text(value),
          );
        }).toList(),
        style:
            const TextStyle(fontSize: _fontSize, fontWeight: FontWeight.w300),
      )
    ]);
  }
}

formField(String hintText, String label, TextEditingController textController) {
  return TextFormField(
    controller: textController,
    obscureText: hintText == 'Mot de passe',
    enableSuggestions: hintText != 'Mot de passe',
    style: const TextStyle(fontSize: _fontSize),
    keyboardType: hintText == 'Nombre de membres maximum'
        ? TextInputType.number
        : TextInputType.text,
    maxLines: 1,
    autofocus: false,
    decoration: InputDecoration(
      errorStyle: const TextStyle(fontSize: _fontSize),
      hintText: hintText,
      hintStyle: const TextStyle(
        fontSize: _fontSize,
      ),
      contentPadding: const EdgeInsets.all(padding),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(3.0)),
    ),
    validator: (value) {
      if (textController == titreController) {
        if (value!.length < 8) {
          return 'Le titre doit avoir 8 caractères au minimum';
        }
      } else if (textController == passController) {
        // alphanumeric
        RegExp regExp = RegExp(r'^[a-zA-Z0-9]+$');
        if (value!.length < 4) {
          return 'Le mot de passe doit avoir 4 caractères au minimum';
        } else if (!regExp.hasMatch(value)) {
          return 'Votre mot de passe ne peut pas contenir de symbole!';
        }
      } else if (textController == memberController) {
        if (int.tryParse(value!) == null) {
          return 'Veuillez entrez un nombre maximal valide (i.e. 1, 2, 3...256) ';
        } else if (int.parse(value) == 0) {
          return 'Le nombre maximal ne peut pas être vide.';
        }
      } else if (value == null || value.isEmpty) {
        return 'Veuillez remplir cette option svp.';
      }
      _formKey.currentState!.save();
      return null;
    },
  );
}

/// Allow the text size to shrink to fit in the space
class _GridTitleText extends StatelessWidget {
  const _GridTitleText(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return FittedBox(
      fit: BoxFit.scaleDown,
      alignment: AlignmentDirectional.centerStart,
      child: Text(text),
    );
  }
}
enum WhyFarther { harder, smarter, selfStarter, tradingCharter }
class _Drawing extends StatelessWidget {
  const _Drawing({
    required this.drawing,
  });

  final Drawing drawing;

  popup() {
    return PopupMenuButton(
        itemBuilder: (context) => [
          PopupMenuItem(
            child: Text("First"),
            value: 1,
          ),
          PopupMenuItem(
            child: Text("Second"),
            value: 2,
          )
        ]
    );
  }


  joinDessinDialog(context) async {
    final Widget thumbnail = getThumbnail();
    showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
                titlePadding: EdgeInsets.zero,
                title: Container(
                    padding: EdgeInsets.all(10.0),
                    color: kContentColor,
                    child: Center(child: Text(drawing.title))),
                content: SingleChildScrollView(
                    child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                      Row(children: <Widget>[
                        Expanded(
                            child: SizedBox(
                                width: MediaQuery.of(context).size.width / 2,
                                child: gridTileJoin(thumbnail))),
                        SizedBox(
                            width: MediaQuery.of(context).size.width / 4,
                            child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  richTextWhitePurple(
                                      'Auteur : ', drawing.authorUsername),
                                  const SizedBox(height: 48.0),
                                  richTextWhitePurple(
                                      'Type    : ',
                                      context
                                          .read<Collaborator>()
                                          .convertToFrench(drawing.type)),
                                  const SizedBox(height: 48.0),
                                  richTextWhitePurple(
                                      'Nombre de membres: ',
                                      drawing.collaboration.memberCount
                                          .toString()),
                                  const SizedBox(height: 48.0),
                                  richTextWhitePurple(
                                      'Créé le: ', drawing.createdAt),
                                  const SizedBox(height: 28.0),
                                  drawing.type == 'Protected' &&
                                          context
                                                      .read<Collaborator>()
                                                      .drawings['Joined']
                                                  [drawing.drawingId] ==
                                              null
                                      ? FormBuilder(
                                          key: _formKey,
                                          child: Column(children: <Widget>[
                                            formField(
                                                'Mot de passe',
                                                'Veuillez entrez le titre du dessin',
                                                passController)
                                          ]))
                                      : const SizedBox.shrink(),
                                ]))
                      ])
                    ])),
                actions: <Widget>[
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: <Widget>[
                      drawing.authorUsername ==
                              context
                                  .read<Collaborator>()
                                  .auth!
                                  .user!
                                  .displayName
                          ? Padding(
                              padding: EdgeInsets.fromLTRB(25.0, 0, 0, 20.0),
                              child: Container(
                                  height: 50,
                                  child: ElevatedButton(
                                    style: ButtonStyle(
                                        backgroundColor:
                                            MaterialStateProperty.all(
                                                Colors.red)),
                                    onPressed: () {
                                      Navigator.pop(context, 'Delete');
                                      alert(
                                          context,
                                          'supprimer',
                                          'Vous pourrez plus le ré-obtenir! 😧',
                                          'Créez-en un autre! 😄');
                                    },
                                    child: const Text('Supprimer'),
                                  )))
                          : const SizedBox.shrink(),
                      context.read<Collaborator>().currentType == 'Available'
                          ? Padding(
                              padding: EdgeInsets.fromLTRB(0, 0, 25.0, 20.0),
                              child: Container(
                                  height: 50,
                                  child: ElevatedButton(
                                    onPressed: () {
                                      context
                                          .read<Collaborator>()
                                          .currentDrawingId = drawing.drawingId;
                                      if (drawing.type == 'Protected') {
                                        _formKey.currentState!.save();
                                        if (_formKey.currentState!.validate()) {
                                          context
                                              .read<Collaborator>()
                                              .collaborationSocket
                                              .joinCollaboration(
                                                  drawing.collaboration
                                                      .collaborationId,
                                                  drawing.type,
                                                  passController.value.text);
                                        }
                                      } else {
                                        context
                                            .read<Collaborator>()
                                            .collaborationSocket
                                            .joinCollaboration(
                                                drawing.collaboration
                                                    .collaborationId,
                                                drawing.type,
                                                null);
                                      }
                                      Navigator.pop(context, 'Joindre');
                                    },
                                    child: const Text('Joindre'),
                                  )))
                          : Padding(
                              padding: EdgeInsets.fromLTRB(0, 0, 25.0, 0.0),
                              child: Container(
                                  height: 50,
                                  child: ElevatedButton(
                                    onPressed: () {
                                      Navigator.pop(context, 'Quitter');
                                      alert(
                                          context,
                                          'quitter',
                                          'Il sera possible de le rejoindre plus tard si il est pas supprimer 😄',
                                          'Aller joindre des dessins!');
                                    },
                                    child: const Text('Quitter'),
                                  ))),
                      context.read<Collaborator>().currentType == 'Available'
                          ? SizedBox.shrink()
                          : Padding(
                              padding: EdgeInsets.fromLTRB(0, 0, 25.0, 20.0),
                              child: Container(
                                  height: 50,
                                  child: ElevatedButton(
                                    onPressed: () {
                                      Navigator.pop(context, 'Se connecter');
                                      context
                                          .read<Collaborator>()
                                          .currentDrawingId = drawing.drawingId;
                                      context
                                          .read<Collaborator>()
                                          .collaborationSocket
                                          .connectCollaboration(drawing
                                              .collaboration.collaborationId);
                                    },
                                    child: const Text('Se connecter'),
                                  ))),
                    ],
                  )
                ]));
  }

  alert(context, type, consequence, result) {
    return showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
              title: Text('Êtes-vous certain de vouloir ${type} ce dessin?.'),
              content: Text(consequence),
              actions: <Widget>[
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context, 'Annuler');
                  },
                  child: const Text('Annuler'),
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context, 'Oui');
                    type == 'supprimer'
                        ? context
                            .read<Collaborator>()
                            .collaborationSocket
                            .deleteCollaboration(
                                drawing.collaboration.collaborationId)
                        : context
                            .read<Collaborator>()
                            .collaborationSocket
                            .leaveCollaboration(
                                drawing.collaboration.collaborationId);
                    showDialog<String>(
                        context: context,
                        builder: (BuildContext context) => AlertDialog(
                              title:
                                  Text('Le dessin à été ${type} avec succès.'),
                              content: Text(result),
                              actions: <Widget>[
                                TextButton(
                                  onPressed: () {
                                    Navigator.pop(context, 'Ok');
                                  },
                                  child: const Text('Ok'),
                                ),
                              ],
                            ));
                  },
                  child: const Text('Oui'),
                ),
              ],
            ));
  }

  @override
  Widget build(BuildContext context) {
    String type = context.read<Collaborator>().convertToFrench(drawing.type);
    final Widget thumbnail = getThumbnail();

    return GestureDetector(
        onTap: () {
          passController.clear();
          joinDessinDialog(context);
        },
        child: gridTile(thumbnail, type));
  }

  gridTile(thumbnail, type) {
    return OrientationBuilder(builder: (context, orientation) {
      return Center(
          child: Padding(
              padding: const EdgeInsets.only(left: 20.0, right: 20.0),
              child: Container(
                  height: 820,
                  decoration: BoxDecoration(
                      border: Border.all(
                          width: 2.5, color: Colors.grey.withOpacity(0.1))),
                  child: Container(
                      color: kContentColor,
                      child: Column(children: <Widget>[
                        Container(
                            height: orientation == Orientation.portrait
                                ? 50.0
                                : MediaQuery.of(context).size.height / 9,
                            child: Row(children: [
                              Column(children: [
                                Padding(
                                    padding: EdgeInsets.all(15.0),
                                    child: CircleAvatar(
                                        radius: 24,
                                        backgroundColor: kPrimaryColor,
                                        backgroundImage: drawing
                                                    .authorUsername !=
                                                'admin'
                                            ? NetworkImage(drawing.authorAvatar)
                                            : Image.asset(
                                                    'assets/images/Boruto_Uzumaki_1.png')
                                                .image))
                              ]),
                              Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Row(children: [
                                      SizedBox(
                                          width: 260,
                                          child: Text(drawing.title,
                                              style: TextStyle(
                                                  fontSize: 20.0,
                                                  fontWeight: FontWeight.bold)))
                                    ]),
                                    Row(children: [
                                      SizedBox(
                                          width: 260,
                                          child: Text(drawing.createdAt,
                                              style: TextStyle(fontSize: 20.0)))
                                    ]),
                                  ]),
                              // Column(children: [
                              //   SizedBox(
                              //       width: 30,
                              //       child: popup())
                              // ])
                            ])),
                        Container(
                            width: MediaQuery.of(context).size.width / 2,
                            height: MediaQuery.of(context).size.width / 7,
                            child: GridTile(
                              child: thumbnail,
                            )),
                        const SizedBox(height: 10),
                        Text('Auteur: ' + drawing.authorUsername,
                            style: TextStyle(fontSize: 20.0)),
                        const SizedBox(height: 10),
                        Text(
                            "Collaborateurs actifs: " +
                                drawing.collaboration.memberCount.toString(),
                            style: TextStyle(fontSize: 20.0)),
                      ])))));
    });
  }

  gridTileJoin(thumbnail) {
    return Padding(
        padding: const EdgeInsets.only(left: 10.0, right: 10.0),
        child: GridTile(
          child: thumbnail,
        ));
  }

  // TODO: Add real thumbnail when ready (drawing.thumbnail)
  getThumbnail() {
    return Material(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(3)),
        clipBehavior: Clip.antiAlias,
        child: FittedBox(
            fit: BoxFit.fill,
            child: drawing.type == 'Protected'
                ? Stack(
                    children: <Widget>[
                      ClipRRect(
                        child: ImageFiltered(
                          imageFilter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                          child: Image.asset(
                              'assets/images/default_thumbnail.png'),
                        ),
                      ),
                      const Positioned(
                        bottom: 170,
                        right:
                            250, //give the values according to your requirement
                        child:
                            Icon(Icons.lock, color: Colors.black, size: 100.0),
                      ),
                    ],
                  )
                : Image.asset('assets/images/default_thumbnail.png')));
  }

  richTextWhitePurple(String text1, String text2) {
    return Padding(
        padding: EdgeInsets.only(left: 15.0),
        child: RichText(
          text: TextSpan(
            // Note: Styles for TextSpans must be explicitly defined.
            // Child text spans will inherit styles from parent
            style: const TextStyle(fontSize: 22.0),
            children: <TextSpan>[
              TextSpan(text: text1),
              TextSpan(
                  text: text2,
                  style: TextStyle(
                      fontWeight: FontWeight.bold, color: kPrimaryColor)),
            ],
          ),
        ));
  }
}
