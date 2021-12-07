import 'dart:convert';
import 'dart:core';
import 'dart:core';

import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/models/collaboration.dart';
import 'package:Colorimage/models/drawing.dart';
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
PagingController pagingController =
    PagingController<int, Team>(firstPageKey: 0);
TextEditingController searchController = TextEditingController();
ScrollController scrollController = ScrollController();
String dropDownControllerType = 'Aucun';

String dropDownControllerTypeCreate = 'Public';
String dropDownControllerMascot = 'Choisir pour moi!';

class TeamsScreen extends StatefulWidget {
  const TeamsScreen({Key? key}) : super(key: key);

  @override
  _TeamsScreenState createState() => _TeamsScreenState();
}

class _TeamsScreenState extends State<TeamsScreen> {
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
    context.read<Teammate>().hasBeenInitialized = true;
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
                }),
            title: const Text("Équipe de collaborations"),
            actions: <Widget>[
              IconButton(
                  icon: Icon(Icons.message),
                  onPressed: () => context.read<Messenger>().openDrawer()),
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
                          child: _Team(item, dropDown, formField));
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
              content: SingleChildScrollView(child: create()),
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
                              _onLoading(context);
                            }
                          },
                          child: const Text('Créer'),
                        ))),
              ],
            ));
  }

  create() {
    return Container(
        width: 1000,
        child: ListView(
            shrinkWrap: true,
            padding: const EdgeInsets.only(left: 100.0, right: 100.0),
            children: <Widget>[
              FormBuilder(
                  key: _formKey,
                  child: Column(children: <Widget>[
                    const SizedBox(height: 28.0),
                    SizedBox(
                        width: 900,
                        child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              SizedBox(
                                width: 380,
                                child: formField(
                                    "Nom de l'équipe",
                                    'Veuillez entrez le titre du équipe',
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
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                    formField('Bio (Description)',
                        'Veuillez entrez le titre du équipe', bioController),
                  ]))
            ]));
  }

  void _onLoading(context) {
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
    Future.delayed(const Duration(seconds: 3), () {
      AwesomeDialog(
        context: navigatorKey.currentContext as BuildContext,
        width: 800,
        btnOkColor: Colors.red,
        dismissOnTouchOutside: false,
        dialogType: DialogType.ERROR,
        animType: AnimType.BOTTOMSLIDE,
        title: 'Erreur!',
        desc: 'Il y a eu un probleme dans la validation...',
        btnOkOnPress: () {},
      ).show();
    });
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
  final Function dropDown;
  final Function formField;

  const _Team(this.team, this.dropDown, this.formField);

  @override
  _TeamState createState() => _TeamState(team, dropDown, formField);
}

class _TeamState extends State<_Team> with TickerProviderStateMixin {
  final Team team;
  final Function dropDown;
  final Function formField;
  late TabController _tabController;

  _TeamState(this.team, this.dropDown, this.formField);

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  Future<void> _fetchTeamById(Team team) async {
    RestApi rest = RestApi();
    var response = await rest.team.fetchTeamById(team);

    if (response.statusCode == 200) {
      var jsonResponse = json.decode(response.body);
      var respMembers = jsonResponse['members'];
      List<TeamMember> members = [];
      for (var data in respMembers) {
        if (data != null) {
          members.add(TeamMember(
              username: data['username'],
              avatarUrl: data['avatarUrl'],
              type: data['type'],
              status: data['status'],
              joinedOn: DateFormat('yyyy-MM-dd kk:mm')
                  .format(DateTime.parse(data['joinedOn']))));
        }
      }
      var resDrawings = jsonResponse['drawings'];
      List<Drawing> drawings = [];
      for (var drawing in resDrawings) {
        if (drawing != null) {
          Collaboration collaboration = Collaboration(
            collaborationId: drawing["collaborationId"],
            memberCount: drawing["currentCollaboratorCount"],
            activeMemberCount: drawing["activeCollaboratorCount"],
            members: [],
            actionsMap: {},
            actions: [],
          );
          drawings.add(Drawing(
              drawingId: drawing['drawingId'],
              authorUsername: team.name,
              authorAvatar: team.mascot,
              title: drawing['title'],
              createdAt: DateFormat('yyyy-MM-dd kk:mm')
                  .format(DateTime.parse(drawing['createdAt'])),
              updatedAt: DateFormat('yyyy-MM-dd kk:mm')
                  .format(DateTime.parse(drawing['updatedAt'])),
              collaboration: collaboration,
              type: 'Public',
              thumbnailUrl: drawing['thumbnailUrl']));
        }
      }
      team.members = members;
      team.drawings = drawings;
      context.read<Teammate>().updateTeam(team);
    } else if (response.statusCode == 204) {
      // print(response.body);
      throw ("Theres was a problem in the fetching of teams...");
    } else {
      team.members = [];
      team.drawings = [];
    }
  }

  @override
  Widget build(BuildContext context) {
    return context
        .read<Teammate>().isMember(team) ? GestureDetector(
        onTap: () {
          setCurrentControllerValues();
          _fetchTeamById(team);
          passController.clear();
          // teamInfoDialog(context);
          _onLoading(context);
        },
        child: gridTile(context)) : Container(child: gridTile(context));
  }

  teamInfoDialog(context) async {
    showDialog<String>(
        barrierDismissible: false,
        context: context,
        builder: (BuildContext context) => AlertDialog(
              titlePadding: EdgeInsets.zero,
              title: Column(children: [
                Container(
                    padding: EdgeInsets.all(10.0),
                    color: kContentColor,
                    child: Center(child: Text(team.name))),
                PreferredSize(
                    preferredSize: _tabBar.preferredSize,
                    child: ColoredBox(color: kContentColor, child: _tabBar))
              ]),
              content: Container(
                  height: 500,
                  width: 1000,
                  child: TabBarView(
                      physics: const NeverScrollableScrollPhysics(),
                      controller: _tabController,
                      children: [
                        SingleChildScrollView(
                            child: Column(children: [
                          Container(
                              width: MediaQuery.of(context).size.width,
                              child: Column(children: [
                                titleRow('Utilisateur', 'Status',
                                    'Date rejoint', 'Rôle'),
                                Divider(),
                                members(team),
                              ]))
                        ])),
                        SingleChildScrollView(
                            child: Column(children: [
                          Container(
                              width: MediaQuery.of(context).size.width,
                              child: Column(children: [
                                titleRow('Titre', 'Membres Actifs',
                                    'Date de création', 'Dernière maj'),
                                Divider(),
                                const SizedBox(height: 20),
                                drawings(team),
                              ]))
                        ])),
                        SingleChildScrollView(
                            child: Column(children: [update()])),
                      ])),
              actions: [
                Container(
                    padding: const EdgeInsets.only(
                        left: 50.0, right: 50.0, bottom: 20.0),
                    child: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: <Widget>[
                          _tabController.index == 2
                              ?Container(
                              padding: EdgeInsets.only(right: 150.0),
                              child: ElevatedButton(
                                  style: ButtonStyle(
                                      backgroundColor:
                                      MaterialStateProperty.all(
                                          Colors.red)),
                                  onPressed: () {
                                    AwesomeDialog(
                                      context: navigatorKey.currentContext as BuildContext,
                                      width: 800,
                                      dismissOnTouchOutside: false,
                                      dialogType: DialogType.WARNING,
                                      animType: AnimType.BOTTOMSLIDE,
                                      title: 'Attention!',
                                      desc: 'Êtes-vous certain de vouloir ${team.authorUsername == context
                                          .read<Teammate>().auth!.user!.displayName ? 'supprimer': 'quitter'} ce équipe?.',
                                      btnCancelOnPress: () {
                                        Navigator.pop(context);
                                      },
                                      btnOkOnPress: () {
                                        Navigator.pop(context);
                                        Navigator.pop(context);
                                        team.authorUsername == context
                                            .read<Teammate>().auth!.user!.displayName ? context
                                            .read<Teammate>()
                                            .teamSocket
                                            .deleteTeam(team) : context
                                            .read<Teammate>()
                                            .teamSocket
                                            .leaveTeam(team);
                                      },
                                    ).show();
                                  },
                                  child: team.authorUsername == context
                                      .read<Teammate>().auth!.user!.displayName ? Text('Supprimer') : Text('Quitter')))
                              : SizedBox(),
                          _tabController.index == 2
                              ? Container(
                                  padding: EdgeInsets.only(right: 220.0),
                                  child: ElevatedButton(
                                      onPressed: () {
                                        _formKey.currentState!.save();
                                        if (_formKey.currentState!.validate()) {
                                          var type = context
                                              .read<Teammate>()
                                              .convertToEnglish(
                                                  dropDownControllerTypeCreate);
                                          var mascot = mascotEnglish[
                                                  dropDownControllerMascot] ??
                                              'cobra';
                                          var password = type == 'Protected'
                                              ? passController.value.text
                                              : null;
                                          Team team = Team(
                                              name: titreController.text,
                                              bio: bioController.text,
                                              maxMemberCount: int.tryParse(
                                                      memberController.text) ??
                                                  4,
                                              type: type,
                                              password: password,
                                              mascot: mascot,
                                              members: []);
                                          context
                                              .read<Teammate>()
                                              .teamSocket
                                              .updateTeam(team);
                                        }
                                      },
                                      child: Text('Mettre à jour')))
                              : SizedBox(),
                          ElevatedButton(
                              onPressed: () {
                                _tabController.index = 0;
                                resetController();
                                Navigator.pop(context);
                                Navigator.pop(context);
                              },
                              child: Text('Retour')),
                        ]))
              ],
            ));
  }

  Widget gridTile(BuildContext context) {
    Teammate teammate = context.watch<Teammate>();
    var width = 380.0;
    return Card(
        elevation: 10,
        child: Container(
            decoration: BoxDecoration(
                color: kContentColor,
                border: Border.all(
                    width: 2.5,
                    color: context
                        .read<Teammate>()
                        .auth!
                        .user!
                        .displayName == team.authorUsername
                        ? kPrimaryColor.withOpacity(0.45)
                        : Colors.white.withOpacity(0.15))),
            child: Row(children: <Widget>[
              getThumbnail(context),
              Container(
                height: 150,
                child: Padding(
                  padding: EdgeInsets.fromLTRB(20, 0, 0, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Row(children: [
                        Container(
                            width: 315.0,
                            child: FittedBox(
                              fit: BoxFit.scaleDown,
                              alignment: AlignmentDirectional.centerStart,
                              child: Text(team.name),
                            )),
                        teammate.isMember(team)
                            ? const SizedBox.shrink()
                            : Container(
                                height: 40.0,
                                child: IconButton(
                                  color: kPrimaryColor,
                                  iconSize: 38.0,
                                  icon: Icon(Icons.arrow_circle_up_outlined),
                                  onPressed: () {
                                    AwesomeDialog(
                                      context: navigatorKey.currentContext as BuildContext,
                                      width: 800,
                                      dismissOnTouchOutside: false,
                                      dialogType: DialogType.WARNING,
                                      animType: AnimType.BOTTOMSLIDE,
                                      title: 'Attention!',
                                      desc: 'Êtes-vous certain de vouloir joindre cette équipe?.',
                                      btnCancelOnPress: () {},
                                      btnOkOnPress: () {
                                          if(team.type == 'Protected') {
                                            passController.clear();
                                            joindreDessinDialog();
                                          } else {
                                            context.read<Teammate>().teamSocket.joinTeam(team);
                                          }
                                      },
                                    ).show();
                                  },
                                ))
                      ]),
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
                                : ('\n'.allMatches(team.bio).length + 1) > 1
                                    ? team.bio.replaceAll("\n", "")
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

  joindreDessinDialog() async {
    showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
          titlePadding: EdgeInsets.zero,
          title: Container(
              padding: EdgeInsets.all(10.0),
              color: kContentColor,
              child: Center(child: Text('Mot de passe'))),
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
                              const SizedBox(height: 48.0),
                              formField(
                                  'Mot de passe',
                                  'Veuillez entrez choisir un mot de passe',
                                  passController),
                            ]))
                      ]))),
          actions: <Widget>[
            Padding(
                padding: EdgeInsets.fromLTRB(0, 0, 25.0, 20.0),
                child: Container(
                    child: ElevatedButton(
                      onPressed: () {
                        _formKey.currentState!.save();
                        if (_formKey.currentState!.validate()) {
                          team.password = passController.text;
                          context.read<Teammate>().teamSocket.joinTeam(team);
                          Navigator.pop(context);
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
                            desc: 'Il y a eu un probleme dans la validation...',
                            btnOkOnPress: () {},
                          ).show();
                        }
                      },
                      child: const Text('Joindre'),
                    ))),
          ],
        ));
  }

  member(Team team, index) {
    const fontSize = 24.0;
    return Row(children: [
      Container(
        child: Row(children: [
          Container(
              width: 220,
              child: Row(children: [
                CircleAvatar(
                    radius: 40,
                    backgroundColor: kPrimaryColor,
                    backgroundImage:
                        NetworkImage(team.members[index].avatarUrl!)),
                const SizedBox(width: 10),
                Container(width: 100, child: FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: AlignmentDirectional.centerStart,
                  child: Text(team.members[index].username!,
                      style: TextStyle(fontSize: fontSize)),
                ))
              ])),
          Container(
              width: 260,
              child: Row(children: [
                team.members[index].status! == 'En ligne'
                    ? Row(children: [
                        const Icon(
                          Icons.circle,
                          color: Colors.green,
                          size: 15.0,
                        ),
                        const SizedBox(width: 10),
                        Text(team.members[index].status!,
                            style: TextStyle(fontSize: fontSize))
                      ])
                    : Row(children: [
                        const Icon(
                          Icons.circle,
                          color: Colors.red,
                          size: 15.0,
                        ),
                        const SizedBox(width: 10),
                        Text(team.members[index].status!,
                            style: TextStyle(fontSize: fontSize))
                      ]),
              ])),
          Container(
              width: 300,
              child: Row(children: [
                Text(team.members[index].joinedOn!,
                    style: TextStyle(fontSize: fontSize))
              ])),
          Container(
              width: 200,
              child: Row(children: [
                team.members[index].type! == 'Owner'
                    ? Row(children: const [
                        Text('Propriétaire',
                            style: TextStyle(fontSize: fontSize)),
                        Icon(Icons.star, color: Colors.yellow),
                      ])
                    : const Text('Membre', style: TextStyle(fontSize: fontSize))
              ]))
        ]),
      )
    ]);
  }

  members(Team team) {
    const space = 60.0;
    const fontSize = 24.0;
    return ListView.separated(
      shrinkWrap: true,
      itemCount: team.members.length,
      itemBuilder: (BuildContext context, int index) {
        return member(team, index);
      },
      separatorBuilder: (BuildContext context, int index) => const Divider(),
    );
  }

  drawing(Team team, index) {
    const fontSize = 24.0;
    return Row(children: [
      Container(
        child: Row(children: [
          Container(
              width: 220,
              child: FittedBox(
                fit: BoxFit.scaleDown,
                alignment: AlignmentDirectional.centerStart,
                child: Text(team.drawings[index].title,
                    style: TextStyle(fontSize: fontSize)),
              )),
          Container(
              width: 260,
              child: Text(
                  "${team.drawings[index].collaboration.activeMemberCount}/${team.drawings[index].collaboration.memberCount}",
                  style: TextStyle(fontSize: fontSize))),
          Container(
              width: 270,
              child: Row(children: [
                Text(team.drawings[index].createdAt,
                    style: TextStyle(fontSize: fontSize))
              ])),
          Container(
              width: 200,
              child: Text(team.drawings[index].updatedAt!,
                  style: TextStyle(fontSize: fontSize))),
          //todo
          // Container(
          //     width: 20,
          //     child: PopupMenuButton(
          //         itemBuilder: (context) => [
          //               PopupMenuItem(
          //                 child: const Text("Rejoindre",
          //                     style: TextStyle(fontSize: fontSize)),
          //                 value: 1,
          //                 onTap: () {},
          //               ),
          //               PopupMenuItem(
          //                 child: const Text("Supprimer",
          //                     style: TextStyle(fontSize: fontSize)),
          //                 value: 2,
          //                 onTap: () {},
          //               )
          //             ]))
        ]),
      )
    ]);
  }

  drawings(Team team) {
    const space = 60.0;
    const fontSize = 24.0;
    return team.drawings.isNotEmpty
        ? ListView.separated(
            shrinkWrap: true,
            itemCount: team.drawings.length,
            itemBuilder: (BuildContext context, int index) {
              return drawing(team, index);
            },
            separatorBuilder: (BuildContext context, int index) =>
                const Divider(),
          )
        : Column(children: const [
            Icon(Icons.image_not_supported_outlined, size: 280.0),
            Text("Cette équipe n'est auteure d'aucun dessin..."),
            Text("Aller dans la section Galérie pour en créer!")
          ]);
  }

  update() {
    return Container(
        width: 1000,
        child: ListView(
            physics: NeverScrollableScrollPhysics(),
            shrinkWrap: true,
            padding: const EdgeInsets.only(left: 100.0, right: 100.0),
            children: <Widget>[
              FormBuilder(
                  key: _formKey,
                  child: Column(children: <Widget>[
                    const SizedBox(height: 28.0),
                    SizedBox(
                        width: 900,
                        child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              SizedBox(
                                width: 380,
                                child: formField(
                                    "Nom de l'équipe",
                                    "Veuillez entrez le titre de l'équipe",
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
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                    formField('Bio (Description)',
                        'Veuillez entrez le titre du équipe', bioController),
                  ]))
            ]));
  }

  titleRow(col1, col2, col3, col4) {
    const fontSize = 24.0;
    return Row(children: [
      Container(
        child: Row(children: [
          Container(
              width: 220,
              child: Row(children: [
                Text(col1, style: TextStyle(fontSize: fontSize))
              ])),
          Container(
              width: 260,
              child: Row(children: [
                Text(col2, style: TextStyle(fontSize: fontSize))
              ])),
          Container(
              width: 300,
              child: Row(children: [
                Text(col3, style: TextStyle(fontSize: fontSize))
              ])),
          Container(
              width: 150,
              child: Row(children: [
                Text(col4, style: TextStyle(fontSize: fontSize))
              ])),
        ]),
      )
    ]);
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
                Icon(Icons.group),
                SizedBox(width: 8),
                Text('Membres', style: TextStyle(fontSize: 18)),
              ],
            ),
          ),
          Tab(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                Icon(Icons.brush_sharp),
                SizedBox(width: 8),
                Text('Dessins', style: TextStyle(fontSize: 18)),
              ],
            ),
          ),
          Tab(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                Icon(Icons.settings),
                SizedBox(width: 8),
                Text('Mise a jour', style: TextStyle(fontSize: 18)),
              ],
            ),
          ),
        ],
      );

  resetController() {
    titreController.clear();
    passController.clear();
    memberController.clear();
    bioController.clear();
    dropDownControllerTypeCreate = 'Public';
    dropDownControllerMascot = 'Choisir pour moi!';
  }

  setCurrentControllerValues() {
    titreController.text = team.name;
    passController.text = team.password ?? '';
    memberController.text = team.maxMemberCount.toString();
    bioController.text = team.bio;
    dropDownControllerTypeCreate = team.type;
    dropDownControllerMascot = mascotEnglish.keys.firstWhere((element) {
      return mascotEnglish[element] == team.mascot;
    });
  }

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

  void _onLoading(context) {
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
    Future.delayed(const Duration(seconds: 3), () {
      teamInfoDialog(context);
    });
  }
}
