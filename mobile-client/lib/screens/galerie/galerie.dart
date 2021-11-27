import 'dart:convert';
import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/models/collaboration.dart';
import 'package:Colorimage/models/drawing.dart';
import 'package:Colorimage/providers/collaborator.dart';
import 'package:Colorimage/utils/rest/rest_api.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:http/src/response.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'package:provider/src/provider.dart';
import 'package:intl/intl.dart';

const _fontSize = 20.0;
const padding = 30.0;
const TYPES = ["Available", "Joined"];
final _formKey = GlobalKey<FormBuilderState>();

class Galerie extends StatefulWidget {
  @override
  GalerieState createState() => GalerieState();
}

class GalerieState extends State<Galerie> with TickerProviderStateMixin {
  Map pagingControllers = <String, PagingController<int, Drawing>>{};
  Map searchControllers = <String, TextEditingController>{};
  Map scrollControllers = <String, ScrollController>{};
  late TabController _tabController;
  static const _pageSize = 12;

  static String dropDownValueTypeCreate = 'Public';
  static String dropDownValueAuthor = 'Moi';
  static String dropDownValueType = 'Aucun';

  GalerieState() {
    for (var type in TYPES) {
      pagingControllers.putIfAbsent(
          type, () => PagingController<int, Drawing>(firstPageKey: 0));
      searchControllers.putIfAbsent(type, () => TextEditingController());
      scrollControllers.putIfAbsent(type, () => ScrollController());
    }
  }

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    pagingControllers.forEach((key, value) {
      value.addPageRequestListener((pageKey) {
        _fetchDrawings(pageKey, key, dropDownValueType);
      });
      value.addStatusListener((status) {
        if (status == PagingStatus.completed) {
          ScaffoldMessenger.of(context).clearSnackBars();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text(
                "Il n'y a plus de dessins disponibles",
              ),
              action: SnackBarAction(
                label: 'Ok',
                onPressed: () {},
              ),
            ),
          );
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
            _fetchDrawings(pageKey, section, dropDownValueType);
          }
        }
      });
    });
  }

  Future<void> _fetchDrawings(int pageKey, String section, String? type) async {
    RestApi rest = RestApi();
    type = (context.read<Collaborator>().convertToEnglish(type));
    String? filter = (searchControllers[section] as TextEditingController).text;
    if (type == 'Aucun') {
      type = null;
    }
    if (filter.isEmpty) {
      filter = null;
    }
    Response response;
    if (section == 'Available') {
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
        Collaboration collaboration = Collaboration(
            collaborationId: drawing["collaboration_id"],
            memberCount: drawing["collaborator_count"],
            maxMemberCount: drawing["max_collaborator_count"]);
        // TODO: add updated_at && thumbnail url
        drawings.add(Drawing(
            drawingId: drawing['drawing_id'],
            authorUsername: drawing["author_username"],
            authorAvatar: drawing["author_avatar"],
            title: drawing['title'],
            createdAt: DateFormat('yyyy-MM-dd kk:mm')
                .format(DateTime.parse(drawing['created_at'])),
            collaboration: collaboration,
            type: drawing['type']));
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
      print(response.body);
    }
  }

  TabBar get _tabBar => TabBar(
        indicatorWeight: 5.0,
        controller: _tabController,
        onTap: (value) {
          setState(() {
            dropDownValueType = 'Aucun';
            searchControllers.update(
                TYPES[value], (value) => TextEditingController());
            pagingControllers[TYPES[value]].refresh();
          });
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
            title: const Text("Galerie de dessins"),
            actions: <Widget>[
              IconButton(
                  icon: const Icon(CupertinoIcons.plus,
                      color: Colors.white, size: 34),
                  onPressed: () {
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
            width: 1050.0,
            child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  SizedBox(
                      width: 500,
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
                          hintText: "Filtrer les dessins selon un attribut",
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
                      width: 500,
                      child: dropDown(
                          ['Aucun', 'Public', 'Protégé', 'Privée'],
                          dropDownValueType,
                          'Filtrer selon un type de dessins'))
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
                showNewPageProgressIndicatorAsGridChild: false,
                showNewPageErrorIndicatorAsGridChild: false,
                showNoMoreItemsIndicatorAsGridChild: false,
                scrollController:
                    scrollControllers[context.read<Collaborator>().currentType],
                pagingController: pagingController,
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  childAspectRatio: 3 / 2,
                  crossAxisCount: orientation == Orientation.portrait ? 2 : 3,
                  mainAxisSpacing: 18,
                  crossAxisSpacing: 5,
                ),
                builderDelegate: PagedChildBuilderDelegate<Drawing>(
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

  createDessinDialog() async {
    showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
              title: const Center(
                  child: Padding(
                      padding: EdgeInsets.only(top: 20.0),
                      child: Text('Créer un dessin'))),
              content: Column(children: [
                Expanded(
                    child: SizedBox(
                        width: 1000,
                        child: ListView(
                            shrinkWrap: true,
                            padding: const EdgeInsets.only(
                                left: 100.0, right: 100.0),
                            children: <Widget>[
                              FormBuilder(
                                  key: _formKey,
                                  child: Column(children: <Widget>[
                                    const SizedBox(height: 28.0),
                                    dropDown(
                                        ['Moi', 'Équipe'],
                                        dropDownValueAuthor,
                                        'Choisir un auteur'),
                                    // TODO: Add teams when ready
                                    dropDownValueAuthor == 'Équipe'
                                        ? dropDown(
                                            ['Moi', 'Équipe'],
                                            dropDownValueAuthor,
                                            'Choisir un auteur')
                                        : const SizedBox.shrink(),
                                    const SizedBox(height: 48.0),
                                    formField('Titre',
                                        'Veuillez entrez le titre du dessin'),
                                    const SizedBox(height: 48.0),
                                    formField('Nombre de membres maximum',
                                        'Veuillez entrez choisir un auteur'),
                                    const SizedBox(height: 48.0),
                                    dropDown(
                                        ['Public', 'Protégé', 'Privée'],
                                        dropDownValueTypeCreate,
                                        'Choisir un type de dessins'),
                                    const SizedBox(height: 48.0),
                                    formField('Mot de passe',
                                        'Veuillez entrez choisir un mot de passe'),
                                  ]))
                            ])))
              ]),
              actions: <Widget>[
                TextButton(
                  onPressed: () {
                    _formKey.currentState!.save();
                    if (_formKey.currentState!.validate()) {
                      print(_formKey.currentState!.value);
                    } else {
                      print("validation failed");
                    }
                  },
                  child: const Text('Créer'),
                ),
              ],
            ));
  }

  dropDown(List<String> items, value, inputHint) {
    return Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
      DropdownButtonFormField<String>(
        value: value,
        decoration: InputDecoration(
          labelText: inputHint,
          labelStyle: const TextStyle(fontSize: _fontSize),
          border:
              OutlineInputBorder(borderRadius: BorderRadius.all(Radius.zero)),
        ),
        icon: const Align(
            alignment: Alignment.topRight,
            child: Icon(Icons.arrow_downward, size: 35.0)),
        onChanged: (String? newValue) {
          setState(() {
            dropDownValueType = newValue!;
            pagingControllers[context.read<Collaborator>().currentType]
                .refresh();
          });
        },
        items: items.map<DropdownMenuItem<String>>((String value) {
          return DropdownMenuItem<String>(
            value: value,
            child: Text(value),
          );
        }).toList(),
        style: TextStyle(fontSize: _fontSize, fontWeight: FontWeight.w300),
      )
    ]);
  }
}

formField(String hintText, String label) {
  return TextFormField(
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
    autovalidate: true,
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

class _Drawing extends StatelessWidget {
  const _Drawing({
    required this.drawing,
  });

  final Drawing drawing;

  joinDessinDialog(context) async {
    final Widget thumbnail = getThumbnail();
    showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
              title: Center(child: Text('Joindre ${drawing.title} ?')),
              content: Column(children: [
                Expanded(
                    child: SingleChildScrollView(
                        child: Row(children: <Widget>[
                  SizedBox(width: 680, child: gridTileJoin(thumbnail)),
                  SizedBox(
                      width: 400,
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 48.0),
                            richTextWhitePurple(
                                'Auteur : ', drawing.authorUsername),
                            const SizedBox(height: 48.0),
                            richTextWhitePurple(
                                'Type    : ',
                                context
                                    .read<Collaborator>()
                                    .convertToFrench(drawing.type)),
                            const SizedBox(height: 48.0),
                            richTextWhitePurple('Nombre de membres: ',
                                drawing.collaboration.memberCount.toString()),
                            const SizedBox(height: 48.0),
                            richTextWhitePurple(
                                'Nombre de membres max: ',
                                drawing.collaboration.maxMemberCount
                                    .toString()),
                            const SizedBox(height: 48.0),
                            richTextWhitePurple('Créé le: ', drawing.createdAt),
                            const SizedBox(height: 28.0),
                            drawing.type == 'Protected'
                                ? formField('Mot de passe',
                                    'Veuillez entrez le titre du dessin')
                                : const SizedBox.shrink(),
                          ]))
                ])))
              ]),
              actions: <Widget>[
                TextButton(
                  onPressed: () {
                    Navigator.pop(context, 'Joindre');
                  },
                  child: const Text('Joindre'),
                ),
              ],
            ));
  }

  @override
  Widget build(BuildContext context) {
    String type = context.read<Collaborator>().convertToFrench(drawing.type);
    final Widget thumbnail = getThumbnail();

    return GestureDetector(
        onTap: () => {joinDessinDialog(context)},
        child: gridTile(thumbnail, type));
  }

  gridTile(thumbnail, type) {
    return Padding(
        padding: const EdgeInsets.only(left: 10.0, right: 10.0),
        child: GridTile(
          header: Center(
              child: Padding(
                  padding: const EdgeInsets.only(top: 10.0),
                  child: _GridTitleText(drawing.title))),
          footer: Material(
            color: Colors.transparent,
            clipBehavior: Clip.antiAlias,
            child: GridTileBar(
              backgroundColor: Colors.black45,
              leading: const CircleAvatar(
                radius: 24,
                backgroundColor: kPrimaryColor,
                child: Icon(Icons.group, color: Colors.black),
              ),
              title: _GridTitleText(drawing.authorUsername),
              subtitle: _GridTitleText(type),
              trailing: _GridTitleText(
                  drawing.collaboration.memberCount.toString() +
                      "/" +
                      drawing.collaboration.maxMemberCount.toString()),
            ),
          ),
          child: thumbnail,
        ));
  }

  gridTileJoin(thumbnail) {
    return Padding(
        padding: const EdgeInsets.only(left: 10.0, right: 10.0),
        child: GridTile(
          child: thumbnail,
        ));
  }

  getThumbnail() {
    return Container(
      decoration: BoxDecoration(
          border: Border.all(width: 2.5, color: Colors.grey.withOpacity(0.2))),
      child: Material(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(3)),
        clipBehavior: Clip.antiAlias,
        child: Image.network(
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/A_black_image.jpg/640px-A_black_image.jpg'),
      ),
    );
  }

  richTextWhitePurple(String text1, String text2) {
    return RichText(
      text: TextSpan(
        // Note: Styles for TextSpans must be explicitly defined.
        // Child text spans will inherit styles from parent
        style: const TextStyle(fontSize: 22.0),
        children: <TextSpan>[
          TextSpan(text: text1),
          TextSpan(
              text: text2,
              style:
                  TextStyle(fontWeight: FontWeight.bold, color: kPrimaryColor)),
        ],
      ),
    );
  }
}
