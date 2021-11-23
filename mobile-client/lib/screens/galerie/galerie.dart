import 'dart:convert';
import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/models/collaboration.dart';
import 'package:Colorimage/models/drawing.dart';
import 'package:Colorimage/providers/collaborator.dart';
import 'package:Colorimage/utils/rest/rest_api.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'package:provider/src/provider.dart';

const _fontSize = 20.0;
const padding = 30.0;


class Galerie extends StatefulWidget {
  @override
  GalerieState createState() => GalerieState();
}

final _formKey = GlobalKey<FormBuilderState>();

class GalerieState extends State<Galerie> {
  TextEditingController searchController = TextEditingController();

  static const _pageSize = 12;

  final PagingController<int, Drawing> _pagingController =
      PagingController(firstPageKey: 0);

  @override
  void initState() {
    _pagingController.addPageRequestListener((pageKey) {
      _fetchDrawings(pageKey);
    });
    super.initState();
  }

  Future<void> _fetchDrawings(int pageKey) async {
    try {
      RestApi rest = RestApi();
      var response = await rest.drawing
          .fetchDrawings(null, _pageSize * pageKey, _pageSize, "Public");
      if (response.statusCode == 200) {
        var jsonResponse =
            json.decode(response.body) as List<dynamic>; //Map<String, dynamic>;
        print('fetchDrawings');
        print(jsonResponse);
        List<Drawing> drawings = [];
        for (var drawing in jsonResponse) {
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
              createdAt: drawing['created_at'],
              collaboration: collaboration,
              type: drawing['type']));
        }
        final isLastPage = drawings.length < _pageSize;
        if (isLastPage) {
          _pagingController.appendLastPage(drawings);
        } else {
          final nextPageKey = pageKey + drawings.length;
          _pagingController.appendPage(drawings, nextPageKey);
        }
        context.read<Collaborator>().addDrawings(drawings);
      }
    } catch (error) {
      _pagingController.error = error;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                    // createDessinDialog();
                  })
            ]),
        body: Container(
          child: Column(children: <Widget>[
            const SizedBox(height: 24.0),
            Container(
                width: 500.0,
                child: TextField(
                  style: const TextStyle(fontSize: 25),
                  controller: searchController,
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
            const SizedBox(height: 24.0),
            Expanded(
                child: PagedGridView<int, Drawing>(
              pagingController: _pagingController,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                childAspectRatio: 3 / 2,
                crossAxisCount: 3,
                mainAxisSpacing: 18,
                crossAxisSpacing: 5,
              ),
              builderDelegate: PagedChildBuilderDelegate<Drawing>(
                itemBuilder: (context, item, index) => _Drawing(
                  drawing: item,
                ),
              ),
            ))
          ]),
        ));
  }

  // createDessinDialog() async {
  //   showDialog<String>(
  //       context: context,
  //       builder: (BuildContext context) => AlertDialog(
  //             title: const Text('Créer un dessin'),
  //             content:       FormBuilder(
  //                 key: _formKey,
  //                 child: Column(
  //                   children: <Widget>[
  //
  //                     FormBuilderTextField(
  //                       name: 'age',
  //                       decoration: InputDecoration(
  //                         labelText:
  //                         'This value is passed along to the [Text.maxLines] attribute of the [Text] widget used to display the hint text.',
  //                       ),
  //                       onChanged: _onChanged,
  //                       // valueTransformer: (text) => num.tryParse(text),
  //                       validator: FormBuilderValidators.compose([
  //                         FormBuilderValidators.required(context),
  //                         FormBuilderValidators.numeric(context),
  //                         FormBuilderValidators.max(context, 70),
  //                       ]),
  //                       keyboardType: TextInputType.number,
  //                     ),])),
  //             actions: <Widget>[
  //               TextButton(
  //                 onPressed: () {
  //                   Navigator.pop(context, 'Créer');
  //                 },
  //                 child: const Text('Créer'),
  //               ),
  //             ],
  //           ));
  // }

  @override
  void dispose() {
    _pagingController.dispose();
    super.dispose();
  }
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
    showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
          title: const Text('Joindre le dessin'),
          content: TextFormField(
            style: const TextStyle(fontSize: _fontSize),
            maxLines: 1,
            autofocus: false,
            decoration: InputDecoration(
              errorStyle: const TextStyle(fontSize: _fontSize),
              hintText: "Mot de Passe",
              hintStyle: const TextStyle(
                fontSize: _fontSize,
              ),
              contentPadding: const EdgeInsets.all(15.0),
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12.0)),
            ),
            autovalidate: true,
            // onFieldSubmitted: (value) {
            //   if (_formKey.currentState!.validate()) {
            //     _onSubmitTap(context, userController.text);
            //   }
            // },
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                Navigator.pop(context, 'Créer');
              },
              child: const Text('Joindre'),
            ),
          ],
        ));
  }

  @override
  Widget build(BuildContext context) {
    final Widget thumbnail = Container(
      decoration: BoxDecoration(
          border: Border.all(width: 2.5, color: Colors.grey.withOpacity(0.2))),
      child: Material(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(3)),
        clipBehavior: Clip.antiAlias,
        child: Image.network(
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/A_black_image.jpg/640px-A_black_image.jpg'),
      ),
    );

    return GestureDetector(
      onTap: () => { joinDessinDialog(context) },
      child: Padding( padding: const EdgeInsets.only(left: 10.0, right: 10.0), child:GridTile(
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
          subtitle: _GridTitleText(drawing.type),
          trailing: _GridTitleText(
              drawing.collaboration.memberCount.toString() +
                  "/" +
                  drawing.collaboration.maxMemberCount.toString()),
        ),
      ),
      child: thumbnail,
    )));
  }
}
