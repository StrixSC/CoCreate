import 'package:Colorimage/constants/general.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class Profile extends StatefulWidget {
  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<Profile> {

  List<String> entries = <String>['A', 'B', 'C'];
  List<int> colorCodes = <int>[600, 500, 100];
  List<double> height = <double>[250.0, 65.0, 400.0];

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
                onPressed: () {})
          ]),
      body: DefaultTabController(
        length: 2,
        child: NestedScrollView(
          headerSliverBuilder: (context, _) {
            return [
              SliverList(
                delegate: SliverChildListDelegate(
                  [],
                ),
              ),
            ];
          },
          body: Column(
            children: <Widget>[
              Expanded(
                child:

          ListView.builder(
          padding: const EdgeInsets.all(8),
            itemCount: entries.length,
            itemBuilder: (BuildContext context, int index) {
              return Container(
                height: height[index],
                color: Colors.amber[colorCodes[index]],
                child: Center(child: Text('Entry ${entries[index]}')),
              );
            }
        )
              )
            ],
          ),
        ),
      ),
    );
  }
}
