import 'package:Colorimage/constants/general.dart';
import 'package:flutter/material.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';

class Team extends StatefulWidget {
  Team();

  @override
  _TeamScreenState createState() => _TeamScreenState();
}

class _TeamScreenState extends State<Team> {
  final List _teams = ['Colorimage Test', 'Colorimage Test'];

  _TeamScreenState() {}

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
            child: getTeamPageBody(context)));
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
                      itemBuilder: (context, item, index) => _getItemUI
                    ),
                  ));
            }))
          ]);
        });
  }

  // First Attempt
  Widget _getItemUI(BuildContext context, int index) {
    return Card(
        elevation: 5,
        child: Container(
            decoration: BoxDecoration( color: kContentColor,
                border: Border.all(
                    width: 2.5, color: Colors.grey.withOpacity(0.15))),
            height: MediaQuery.of(context).size.height / 6,
            child: Row(children: <Widget>[
              Container(
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
              ),
              Container(
                height: MediaQuery.of(context).size.height / 8,
                width: 600,
                child: Padding(
                  padding: EdgeInsets.fromLTRB(10, 2, 0, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        _teams[index],
                      ),
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
}
