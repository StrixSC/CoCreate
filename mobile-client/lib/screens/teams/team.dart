import 'dart:convert';

import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/models/team.dart';
import 'package:Colorimage/models/team.dart';
import 'package:Colorimage/providers/messenger.dart';
import 'package:Colorimage/providers/team.dart';
import 'package:Colorimage/utils/rest/rest_api.dart';
import 'package:awesome_dialog/awesome_dialog.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'package:intl/intl.dart';
import 'package:provider/src/provider.dart';

import '../../app.dart';

const _fontSize = 20.0;
const padding = 20.0;
const types = ['Aucun', 'Public', 'Protégé'];
const mascots = [
  'Choisir pour moi!',
  'Tigre',
  'Lion',
  'Éléphant',
  'Morse',
  'Gorille',
  'Cobra',
  'Zebre',
  'Cheval',
  'Aigle'
];

const mascotEnglish = {
  'Choisir pour moi!': '',
  'Tigre': 'tiger',
  'Lion': 'lion',
  'Éléphant': 'elephant',
  'Morse': 'walrus',
  'Gorille': 'gorilla',
  'Cobra': 'cobra',
  'Zebre': 'zebra',
  'Cheval': 'horse',
  'Aigle': 'eagle'
};

final _formKey = GlobalKey<FormBuilderState>();

TextEditingController titreController = TextEditingController();
TextEditingController passController = TextEditingController();
TextEditingController memberController = TextEditingController();
TextEditingController bioController = TextEditingController();

class TeamsScreen extends StatefulWidget {
  const TeamsScreen({Key? key}) : super(key: key);

  @override
  _TeamsScreenState createState() => _TeamsScreenState();
}

class _TeamsScreenState extends State<TeamsScreen> {
  PagingController pagingController =
      PagingController<int, Team>(firstPageKey: 0);
  TextEditingController searchController = TextEditingController();
  ScrollController scrollController = ScrollController();
  String dropDownControllerType = 'Aucun';

  String dropDownControllerTypeCreate = 'Public';
  String dropDownControllerMascot = 'Choisir pour moi!';
  static const _pageSize = 12;

  bool amOwner = false;
  bool amMember = false;
  bool removeFull = false;

  _TeamsScreenState() {
    pagingController = PagingController<int, Team>(firstPageKey: 0);
    searchController = TextEditingController();
    scrollController = ScrollController();
  }

  @override
  void initState() {
    super.initState();
    context.read<Teammate>().pagingController = pagingController;
    pagingController.addPageRequestListener((pageKey) {
      _fetchTeams(pageKey);
    });
    pagingController.addStatusListener((status) {
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
      print(status);
    });

    // Setup the listener.
    scrollController.addListener(() {
      if (scrollController.position.atEdge) {
        if (scrollController.position.pixels == 0) {
          // You're at the top.
        } else {
          // You're at the bottom.
          var pageKey = pagingController.itemList!.length;
          _fetchTeams(pageKey);
        }
      }
    });
  }

  Future<void> _fetchTeams(int pageKey) async {
    RestApi rest = RestApi();
    String? type =
        context.read<Teammate>().convertToEnglish(dropDownControllerType);
    String? filter = searchController.text;

    if (type == 'Aucun') {
      type = null;
    }

    if (filter.isEmpty) {
      filter = null;
    }
    var response = await rest.team.fetchTeams(
        filter, pageKey, _pageSize, type, amOwner, amMember, removeFull);
    print(json.decode(response.body));
    if (response.statusCode == 200) {
      var jsonResponse = json.decode(response.body); //Map<String, dynamic>;
      List<Team> teams = [];
      var resp = jsonResponse['teams'];
      for (var data in resp) {
        if (data != null) {
          List<TeamMember> members = [];
          List teamMembers = data['teamMembers'];
          for (int i = 0; i < teamMembers.length; i++) {
            members.add(TeamMember(
                username: teamMembers[i]['username'],
                avatarUrl: teamMembers[i]['avatarUrl'],
                type: teamMembers[i]['type']));
          }
          Team team = Team(
            authorUsername: data['authorUsername'],
            authorAvatarUrl: data['authorAvatarUrl'],
            thumbnailUrl: data['avatarUrl'],
            bio: data['bio'],
            maxMemberCount: data['maxMemberCount'],
            id: data['teamId'],
            type: data['type'],
            mascot: data['mascot'],
            memberCount: data['currentMemberCount'],
            name: data['teamName'],
            createdAt: DateFormat('yyyy-MM-dd kk:mm')
                .format(DateTime.parse(data['createdAt'])),
            onlineMemberCount: data['onlineMemberCount'],
            members: members,
          );
          teams.add(team);
        }
      }
      final isLastPage = teams.length < _pageSize;
      if (isLastPage) {
        pagingController.appendLastPage(teams);
      } else {
        final nextPageKey = pageKey + teams.length;
        pagingController.appendPage(teams, nextPageKey);
      }
      context.read<Teammate>().addTeams(teams);
    } else if (response.statusCode == 204) {
      // print(response.body);
      pagingController.itemList = [];
      throw ("Theres was a problem in the fetching of teams...");
    } else {
      pagingController.itemList = [];
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        key: const Key('Gallery'),
        resizeToAvoidBottomInset: true,
        appBar: AppBar(
            backgroundColor: kPrimaryColor,
            centerTitle: true,
            automaticallyImplyLeading: false,
            leading: // Ensure Scaffold is in context
                IconButton(
                    icon: Icon(Icons.message),
                    onPressed: () => context.read<Messenger>().openDrawer()),
            title: const Text("Galerie de dessins"),
            actions: <Widget>[
              IconButton(
                  icon: const Icon(CupertinoIcons.plus,
                      color: Colors.white, size: 34),
                  onPressed: () {
                    titreController.clear();
                    passController.clear();
                    memberController.clear();
                    bioController.clear();
                    dropDownControllerTypeCreate = 'Public';
                    dropDownControllerMascot = 'Choisir pour moi!';
                    createTeamsDialog();
                  })
            ]),
        body: Padding(
            padding: EdgeInsets.fromLTRB(0.0, 10.0, 0.0, 0.0),
            child: getTeamPageBody(pagingController, searchController)));
  }

  getTeamPageBody(pagingController, searchController) {
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
                          pagingController.refresh();
                          setState(() {
                            pagingController;
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
                      child: dropDown(types, dropDownControllerType,
                          'Filtrer selon un type'))
                ])),
        Padding(
            padding: EdgeInsets.only(
                left: MediaQuery.of(context).size.width / 4, top: 15.0),
            child: Column(children: [
              SizedBox(
                  width: MediaQuery.of(context).size.width,
                  child: Row(children: [
                    toggleSwitch('owner', 'Filtrer les équipes complètes'),
                  ])),
              SizedBox(
                  width: MediaQuery.of(context).size.width,
                  child: Row(children: [
                    toggleSwitch(
                        'member', 'Afficher les équipes dont je suis membre'),
                  ])),
              SizedBox(
                  width: MediaQuery.of(context).size.width,
                  child: Row(children: [
                    toggleSwitch('full',
                        'Afficher uniquement les équipes créées par moi'),
                  ]))
            ])),
        const SizedBox(height: 20.0),
        Expanded(child: OrientationBuilder(builder: (context, orientation) {
          return RefreshIndicator(
              onRefresh: () => Future.sync(
                    () {
                      pagingController.refresh();
                    },
                  ),
              child: PagedGridView<int, Team>(
                  physics: AlwaysScrollableScrollPhysics(),
                  pagingController: pagingController,
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    childAspectRatio: 10 / 3,
                    crossAxisCount: orientation == Orientation.portrait ? 1 : 2,
                    mainAxisSpacing: 10,
                    crossAxisSpacing: 10,
                  ),
                  builderDelegate: PagedChildBuilderDelegate<Team>(
                    animateTransitions: true,
                    // [transitionDuration] has a default value of 250 milliseconds.
                    transitionDuration: const Duration(milliseconds: 500),
                    noItemsFoundIndicatorBuilder: (context) => Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Center(
                              child:
                                  Text('🧐', style: TextStyle(fontSize: 50))),
                          SizedBox(height: 24.0),
                          Center(
                              child:
                                  Text('Veuillez joindre ou créer une équipe!'))
                        ]),
                    itemBuilder: (context, item, index) {
                      var left = 0.0;
                      var right = 0.0;
                      var padding = 15.0;
                      index % 2 == 0 ? left = padding : right = padding;
                      return Padding(
                          padding: EdgeInsets.fromLTRB(left, 0, right, 0),
                          child: _Team(item));
                    },
                  )));
        }))
      ]);
    });
  }

  dropDown(List<String> items, value, inputHint) {
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
          setState(() {
            if (value == dropDownControllerTypeCreate) {
              dropDownControllerTypeCreate = newValue!;
            } else if (value == dropDownControllerMascot) {
              dropDownControllerMascot = newValue!;
            } else if (value == dropDownControllerType) {
              dropDownControllerType = newValue!;
              pagingController.refresh();
            }
          });
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

  toggleSwitch(type, text) {
    return Row(children: [
      Switch(
        value: type == 'owner'
            ? amOwner
            : type == 'member'
                ? amMember
                : removeFull,
        onChanged: (value) {
          setState(() {
            type == 'owner'
                ? amOwner = value
                : type == 'member'
                    ? amMember = value
                    : removeFull = value;
            pagingController.refresh();
          });
        },
        activeTrackColor: kPrimaryColor.withOpacity(0.5),
        activeColor: kPrimaryColor,
      ),
      Text(text, style: TextStyle(fontSize: 25.0))
    ]);
  }

  createTeamsDialog() async {
    showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
              titlePadding: EdgeInsets.zero,
              title: Container(
                  padding: EdgeInsets.all(10.0),
                  color: kContentColor,
                  child: const Center(child: Text('Créer une équipe'))),
              content: SingleChildScrollView(
                  child: Container(
                      width: 1000,
                      child: ListView(
                          shrinkWrap: true,
                          padding:
                              const EdgeInsets.only(left: 100.0, right: 100.0),
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
                                              width: 380,
                                              child: formField(
                                                  "Nom de l'équipe",
                                                  'Veuillez entrez le titre du dessin',
                                                  titreController),
                                            ),
                                            // const SizedBox(width: 24.0),
                                            SizedBox(
                                                width: 380,
                                                child: formField(
                                                    'Nombre de membres maximum',
                                                    'Veuillez entrez choisir un auteur',
                                                    memberController)),
                                          ])),
                                  const SizedBox(height: 48.0),
                                  SizedBox(
                                      width: 900,
                                      child: Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            SizedBox(
                                              width: 380,
                                              child: dropDown([
                                                'Public',
                                                'Protégé',
                                              ], dropDownControllerTypeCreate,
                                                  "Choisir la visibilité de l'équipe"),
                                            ),
                                            // const SizedBox(width: 24.0),
                                            SizedBox(
                                                width: 380,
                                                child: dropDown(
                                                    mascots,
                                                    dropDownControllerMascot,
                                                    'Choisir une mascot')),
                                          ])),
                                  const SizedBox(height: 48.0),
                                  dropDownControllerTypeCreate == 'Protégé'
                                      ? formField(
                                          'Mot de passe',
                                          'Veuillez entrez choisir un mot de passe',
                                          passController)
                                      : const SizedBox.shrink(),
                                  dropDownControllerTypeCreate == 'Protégé'
                                      ? const SizedBox(height: 48.0)
                                      : const SizedBox.shrink(),
                                  formField(
                                      'Bio (Description)',
                                      'Veuillez entrez le titre du dessin',
                                      bioController),
                                ]))
                          ]))),
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
                                  .read<Teammate>()
                                  .convertToEnglish(
                                      dropDownControllerTypeCreate);
                              var mascot =
                                  mascotEnglish[dropDownControllerMascot] ??
                                      'cobra';
                              var password = type == 'Protected'
                                  ? passController.value.text
                                  : null;
                              Team team = Team(
                                  name: titreController.text,
                                  bio: bioController.text,
                                  maxMemberCount:
                                      int.tryParse(memberController.text) ?? 4,
                                  type: type,
                                  password: password,
                                  mascot: mascot,
                                  members: []);
                              context
                                  .read<Teammate>()
                                  .teamSocket
                                  .createTeam(team);
                              Navigator.of(context).pop();
                            } else {
                              AwesomeDialog(
                                context:
                                    navigatorKey.currentContext as BuildContext,
                                width: 800,
                                btnOkColor: Colors.red,
                                dismissOnTouchOutside: false,
                                dialogType: DialogType.ERROR,
                                animType: AnimType.BOTTOMSLIDE,
                                title: 'Erreur!',
                                desc:
                                    'Il y a eu un probleme dans la validation...',
                                btnOkOnPress: () {},
                              ).show();
                            }
                          },
                          child: const Text('Créer'),
                        ))),
              ],
            ));
  }

  formField(
      String hintText, String label, TextEditingController textController) {
    return TextFormField(
      controller: textController,
      obscureText: hintText == 'Mot de passe',
      enableSuggestions: hintText != 'Mot de passe',
      style: const TextStyle(fontSize: _fontSize),
      keyboardType: hintText == 'Nombre de membres maximum'
          ? TextInputType.number
          : hintText == 'Bio (Description)'
              ? TextInputType.multiline
              : TextInputType.text,
      maxLines: hintText == 'Bio (Description)' ? 2 : 1,
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
          if (value!.length < 3) {
            return 'Le titre doit avoir 3 caractères au minimum';
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
        } else if (textController == bioController) {
          // TODO: bio max????
          if (value!.length > 500) {
            return 'Le bio peut avoir au maximum 500 lettres';
          }
        } else if (value == null || value.isEmpty) {
          return 'Veuillez remplir cette option svp.';
        }
        _formKey.currentState!.save();
        return null;
      },
    );
  }
}

class _Team extends StatefulWidget {
  final Team team;
  const _Team(this.team);

  @override
  _TeamState createState() => _TeamState(team);
}

class _TeamState extends State<_Team> with TickerProviderStateMixin {
  final Team team;
  late TabController _tabController;

  _TeamState(this.team);

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
        onTap: () {
          passController.clear();
          teamInfoDialog(context);
        },
        child: gridTile(context));
  }

  teamInfoDialog(context) async {
    showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
            titlePadding: EdgeInsets.zero,
            title: Container(
                padding: EdgeInsets.all(10.0),
                color: kContentColor,
                child: Center(child: Text(team.name))),
            content:Container(height: 500, width:500,child:TabBarView(
                physics: const NeverScrollableScrollPhysics(),
                controller: _tabController,
                children: [
                  SingleChildScrollView(child: Column(children: [])),
                  SingleChildScrollView(child: Column(children: []))
                ]))));
  }

  Widget gridTile(BuildContext context) {
    var width = 380.0;
    return Card(
        elevation: 10,
        child: Container(
            decoration: BoxDecoration(
                color: kContentColor,
                border: Border.all(
                    width: 2.5, color: Colors.white.withOpacity(0.15))),
            child: Row(children: <Widget>[
              getThumbnail(context),
              Container(
                height: 150,
                child: Padding(
                  padding: EdgeInsets.fromLTRB(20, 0, 0, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Container(
                          child: FittedBox(
                        fit: BoxFit.scaleDown,
                        alignment: AlignmentDirectional.centerStart,
                        child: Text(team.name),
                      )),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(0, 5, 0, 2),
                        child: Container(
                          width: width,
                          child: Text(
                            'Créé le ${team.createdAt}',
                            style: const TextStyle(
                                fontSize: 15, color: Colors.white),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(0, 15, 0, 2),
                        child: Container(
                          width: width,
                          child: Text(
                            team.bio.isEmpty
                                ? ('Aucune biographie')
                                : team.bio.length > 80
                                    ? team.bio.substring(0, 80) + '...'
                                    : team.bio,
                            style: const TextStyle(
                                fontSize: 18, color: Colors.white),
                          ),
                        ),
                      ),
                      Row(children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(0, 5, 0, 2),
                          child: Container(
                            width: width / 2,
                            child: Text(
                              'Membre en ligne: ${team.onlineMemberCount}/${team.maxMemberCount}',
                              style: const TextStyle(
                                  fontSize: 15, color: Colors.white),
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.fromLTRB(0, 5, 0, 2),
                          child: Container(
                            width: width / 2,
                            child: Text(
                              'Membre total: ${team.memberCount}/${team.maxMemberCount}',
                              style: const TextStyle(
                                  fontSize: 15, color: Colors.white),
                            ),
                          ),
                        )
                      ]),
                    ],
                  ),
                ),
              )
            ])));
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

  getThumbnail(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height,
      width: 200.0,
      decoration: BoxDecoration(
          borderRadius: BorderRadius.only(
              bottomLeft: Radius.circular(5), topLeft: Radius.circular(5)),
          image: DecorationImage(
              fit: BoxFit.cover, image: NetworkImage(team.thumbnailUrl))),
    );
  }
}
