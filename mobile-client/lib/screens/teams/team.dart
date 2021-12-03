import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/models/team.dart';
import 'package:Colorimage/providers/team.dart';
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

  PagingController pagingController = PagingController(firstPageKey: 0);
  TextEditingController searchController = TextEditingController();
  Map scrollControllers = ScrollController();
  String dropDownController = 'Aucun';

  @override
  void initState() {
    super.initState();
    context.read<Teammate>().pagingController = pagingController;
    pagingController.addPageRequestListener((pageKey) {
        _fetchDrawings(pageKey);
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
                width: MediaQuery
                    .of(context)
                    .size
                    .width -
                    MediaQuery
                        .of(context)
                        .size
                        .width / 4,
                child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      SizedBox(
                          width: MediaQuery
                              .of(context)
                              .size
                              .width / 3,
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
                              hintText: "Filtrer les équipes selon un attribut",
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
                          width: MediaQuery
                              .of(context)
                              .size
                              .width / 3,
                          child: dropDown(
                              ['Aucun', 'Public', 'Protégé'],
                              dropDownController,
                              'Filtrer selon un type'))
                    ])),
            const SizedBox(height: 40.0),
            Expanded(child: OrientationBuilder(builder: (context, orientation) {
              return RefreshIndicator(
                onRefresh: () =>
                    Future.sync(
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
                      crossAxisCount: orientation == Orientation.portrait
                          ? 2
                          : 3,
                      mainAxisSpacing: 18,
                      crossAxisSpacing: 5,
                    ),
                    builderDelegate: PagedChildBuilderDelegate<Team>(
                        noItemsFoundIndicatorBuilder: (context) =>
                            Column(
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
                    itemBuilder: (context, item, index) => _Team(
                      team: item
                    )
                ),
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
            decoration: BoxDecoration( color: kContentColor,
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
                            style: TextStyle(
                                fontSize: 15,
                                color: Colors.white),
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
    return         Container(
      height: MediaQuery.of(context).size.height / 6,
      width: 170.0,
      decoration: const BoxDecoration(
          borderRadius: BorderRadius.only(
              bottomLeft: Radius.circular(5),
              topLeft: Radius.circular(5)),
          image: DecorationImage(
              fit: BoxFit.cover,
              image: NetworkImage(
                  "https://is2-ssl.mzstatic.com/image/thumb/Video2/v4/e1/69/8b/e1698bc0-c23d-2424-40b7-527864c94a8e/pr_source.lsr/268x0w.png"))),
    );
  }
}