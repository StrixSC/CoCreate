
import 'package:Colorimage/constants/general.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

const _fontSize = 20.0;
const padding = 30.0;

class Galerie extends StatefulWidget {
  @override
  GalerieState createState() => GalerieState();
}

class GalerieState extends State<Galerie> {
  List dataList = <_Photo>[];
  bool isLoading = false;
  int pageCount = 1;
  final List<_Photo> _dessins = [];
  late ScrollController _scrollController;
  static final GlobalKey<FormFieldState<String>> _searchFormKey =
      GlobalKey<FormFieldState<String>>();
  final FocusNode _focusNode = FocusNode();

  TextEditingController searchController = TextEditingController();

  @override
  void initState() {
    fetchDessins();
    addItemIntoLisT(1);
    _scrollController = ScrollController(initialScrollOffset: 5.0)
      ..addListener(_scrollListener);
  }

  void fetchDessins() {
    for (int i = 0; i < 110; i++) {
      _dessins.add(_Photo(
        assetName: 'assets/images/Boruto_Uzumaki_1.png',
        title: 'Boruto Uzumaki',
        subtitle: 'Son of Naruto Uzumaki',
      ));
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
                  onPressed: () {createDessinDialog();
                  })
            ]),
        body: Container(
          child: Column(children: <Widget>[
            const SizedBox(height: 24.0),
            Container(
                width: 500.0,
                child: TextField(
                  key: _searchFormKey,
                  style: const TextStyle(fontSize: 25),
                  controller: searchController,
                  focusNode: _focusNode,
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
                child: GridView.count(
              controller: _scrollController,
              childAspectRatio: 3 / 2,
              scrollDirection: Axis.vertical,
              restorationId: 'grid_offset',
              crossAxisCount: 2,
              mainAxisSpacing: 18,
              crossAxisSpacing: 18,
              padding: const EdgeInsets.all(8),
              physics: const AlwaysScrollableScrollPhysics(),
              children: dataList.map((value) {
                return _GridDemoPhotoItem(
                  photo: value,
                );
              }).toList(),
            ))
          ]),
        ));
  }

  createDessinDialog() async {
    showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
          title: const Text(
              'Créer un dessin'),
          content: TextFormField(
            style: const TextStyle(fontSize: _fontSize),
            maxLines: 1,
            autofocus: false,
            decoration: InputDecoration(
              errorStyle: const TextStyle(fontSize: _fontSize),
              hintText: "Courriel",
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
              child: const Text('Créer'),
            ),
          ],
        ));
  }

  _scrollListener() {
    if (_scrollController.offset >=
            _scrollController.position.maxScrollExtent &&
        !_scrollController.position.outOfRange) {
      setState(() {
        print("comes to bottom $isLoading");
        isLoading = true;

        if (isLoading) {
          print("RUNNING LOAD MORE");

          pageCount = pageCount + 1;

          addItemIntoLisT(pageCount);
        }
      });
    }
  }

  ////ADDING DATA INTO ARRAYLIST
  void addItemIntoLisT(var pageCount) {
    for (int i = (pageCount * 10) - 10; i < pageCount * 10; i++) {
      dataList.add(_dessins[i]);
      isLoading = false;
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }
}

class _Photo {
  _Photo({
    required this.assetName,
    required this.title,
    required this.subtitle,
  });

  final String assetName;
  final String title;
  final String subtitle;
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

class _GridDemoPhotoItem extends StatelessWidget {
  const _GridDemoPhotoItem({
    required this.photo,
  });

  final _Photo photo;

  @override
  Widget build(BuildContext context) {
    final Widget image = Container(
        decoration: BoxDecoration(
            border:
                Border.all(width: 2.5, color: Colors.grey.withOpacity(0.2))),
        child: Material(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(3)),
          clipBehavior: Clip.antiAlias,
          child: Image.asset(
            photo.assetName,
            fit: BoxFit.cover,
          ),
        ));

    return GridTile(
      footer: Material(
        color: Colors.transparent,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(bottom: Radius.circular(3)),
        ),
        clipBehavior: Clip.antiAlias,
        child: GridTileBar(
          backgroundColor: Colors.black45,
          title: _GridTitleText(photo.title),
          subtitle: _GridTitleText(photo.subtitle),
        ),
      ),
      child: image,
    );
  }
}
