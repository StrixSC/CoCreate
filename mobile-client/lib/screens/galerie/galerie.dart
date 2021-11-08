import 'package:flutter/material.dart';

class Galerie extends StatefulWidget {

  @override
  GalerieState createState() => GalerieState();
}

class GalerieState extends State<Galerie> {
  List dataList = <_Photo>[];
  bool isLoading = false;
  int pageCount = 1;
  List<_Photo> _dessins = [];
  late ScrollController _scrollController;

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
        automaticallyImplyLeading: false,
        title: Text("Galerie de dessins"),
      ),
      body: GridView.count(
        controller: _scrollController,
        scrollDirection: Axis.vertical,
        restorationId: 'grid_offset',
        crossAxisCount: 2,
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
        padding: const EdgeInsets.all(8),
        childAspectRatio: 1,
        physics: const AlwaysScrollableScrollPhysics(),
        children: dataList.map((value) {
          return _GridDemoPhotoItem(
            photo: value,
          );

        }).toList(),
      ),
    );
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
    final Widget image = Material(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
      clipBehavior: Clip.antiAlias,
      child: Image.asset(
        photo.assetName,
        fit: BoxFit.cover,
      ),
    );

        return GridTile(
          footer: Material(
            color: Colors.transparent,
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(4)),
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
