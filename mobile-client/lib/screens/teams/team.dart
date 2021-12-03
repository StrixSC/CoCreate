import 'dart:convert';

import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/models/team.dart';
import 'package:Colorimage/models/team.dart';
import 'package:Colorimage/providers/team.dart';
import 'package:Colorimage/utils/rest/rest_api.dart';
import 'package:flutter/material.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'package:provider/src/provider.dart';

const _fontSize = 20.0;
const padding = 30.0;

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
  String dropDownController = 'Aucun';
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
        context.read<Teammate>().convertToEnglish(dropDownController);
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
      print(jsonResponse);
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
        appBar: AppBar(
            backgroundColor: kPrimaryColor,
            centerTitle: true,
            title: Text('Équipe de collaboration'),
            automaticallyImplyLeading: false,
            actions: const <Widget>[
              // IconButton(
              //     icon: const Icon(Icons.list_alt, color: Colors.white, size: 34),
              //     onPressed: () {
              //       openHistoryDialog();
              //     }),
              // const SizedBox(width: 20),
              // IconButton(
              //     icon: const Icon(Icons.settings, color: Colors.white, size: 34),
              //     onPressed: () {
              //       openSettingsDialog();
              //     }),
              // const SizedBox(width: 20)
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
                      child: dropDown(['Aucun', 'Public', 'Protégé'],
                          dropDownController, 'Filtrer selon un type'))
                ])),
        SizedBox(
            width: MediaQuery.of(context).size.width -
                MediaQuery.of(context).size.width / 4,
            child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  toggleSwitch('owner', 'Filtrer les équipes complètes'),
                  toggleSwitch('member', 'Afficher les équipes dont je suis membre'),
                  toggleSwitch('full', 'Afficher uniquement les équipes créées par moi'),
                ])),
        const SizedBox(height: 40.0),
        Expanded(child: OrientationBuilder(builder: (context, orientation) {
          return RefreshIndicator(
              onRefresh: () => Future.sync(
                    () {
                      pagingController.refresh();
                    },
                  ),
              child: PagedGridView<int, Team>(
                physics: AlwaysScrollableScrollPhysics(),
                showNewPageProgressIndicatorAsGridChild: false,
                showNewPageErrorIndicatorAsGridChild: false,
                showNoMoreItemsIndicatorAsGridChild: false,
                pagingController: pagingController,
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  childAspectRatio: (270.0 / 220.0),
                  crossAxisCount: orientation == Orientation.portrait ? 2 : 3,
                  mainAxisSpacing: 18,
                  crossAxisSpacing: 5,
                ),
                builderDelegate: PagedChildBuilderDelegate<Team>(
                    animateTransitions: true,
                    // [transitionDuration] has a default value of 250 milliseconds.
                    transitionDuration: const Duration(milliseconds: 500),
                    noItemsFoundIndicatorBuilder: (context) => Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Center(
                                  child: Text('🧐',
                                      style: TextStyle(fontSize: 50))),
                              SizedBox(height: 24.0),
                              Center(
                                  child: Text(
                                      'Veuillez joindre ou créer une équipe!'))
                            ]),
                    itemBuilder: (context, item, index) => _Team(team: item)),
              ));
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
            dropDownController = newValue!;
            pagingController.refresh();
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
    return SizedBox(
        width: MediaQuery.of(context).size.width / 2,
        child: Column(children: [Switch(
          value: type == 'owner' ? amOwner : type == 'member'? amMember : removeFull,
          onChanged: (value) {
            setState(() {
              type == 'owner' ? amOwner = value : type == 'member'? amMember  = value : removeFull  = value;
              pagingController.refresh();
            });
          },
          activeTrackColor: kPrimaryColor.withOpacity(0.5),
          activeColor: kPrimaryColor,
        ), Text(text)]));
  }
}

class _Team extends StatelessWidget {
  const _Team({
    required this.team,
  });

  final Team team;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
        onTap: () {
          // TODO
        },
        child: gridTile(context));
  }

  Widget gridTile(BuildContext context) {
    return Card(
        elevation: 5,
        child: Container(
            decoration: BoxDecoration(
                color: kContentColor,
                border: Border.all(
                    width: 2.5, color: Colors.grey.withOpacity(0.15))),
            height: MediaQuery.of(context).size.height / 6,
            child: Row(children: <Widget>[
              getThumbnail(context),
              Container(
                height: MediaQuery.of(context).size.height / 8,
                width: 600,
                child: Padding(
                  padding: EdgeInsets.fromLTRB(10, 2, 0, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const Text("Colorimage Test"),
                      Padding(
                        padding: EdgeInsets.fromLTRB(0, 5, 0, 2),
                        child: Container(
                          width: 260,
                          child: const Text(
                            "His genius finally recognized by his idol Chester",
                            style: TextStyle(fontSize: 15, color: Colors.white),
                          ),
                        ),
                      )
                    ],
                  ),
                ),
              )
            ])));
  }

  getThumbnail(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height / 6,
      width: 170.0,
      decoration: const BoxDecoration(
          borderRadius: BorderRadius.only(
              bottomLeft: Radius.circular(5), topLeft: Radius.circular(5)),
          image: DecorationImage(
              fit: BoxFit.cover,
              image: NetworkImage(
                  "https://is2-ssl.mzstatic.com/image/thumb/Video2/v4/e1/69/8b/e1698bc0-c23d-2424-40b7-527864c94a8e/pr_source.lsr/268x0w.png"))),
    );
  }
}
