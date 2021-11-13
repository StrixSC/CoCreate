import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/models/tool.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';

class Toolbar extends StatefulWidget {
  Function changeTool;
  Function changeColor;

  Toolbar(this.changeTool, this.changeColor);

  @override
  State<Toolbar> createState() =>
      _ToolbarState(this.changeTool, this.changeColor);
}

class _ToolbarState extends State<Toolbar> {
  Function changeTool;
  Function changeColor;

  Color currentColor = const Color(0xff443a49);
  String currentTool = '';

  final tools = [
    Tool("line", CupertinoIcons.hand_draw_fill),
    Tool("select", CupertinoIcons.hand_raised_fill),
    Tool("circle", CupertinoIcons.circle),
    Tool("rect", CupertinoIcons.rectangle)
  ];

  _ToolbarState(this.changeTool, this.changeColor);

  // ValueChanged<Color> callback
  void selectColor(Color color) {
    currentColor = color;
    changeColor(currentColor);
  }

  // ValueChanged<Tool> callback
  void selectTool(String type) {
    currentTool = type;
    changeTool(currentTool);
  }

  @override
  Widget build(BuildContext context) {
    return AppBar(
      centerTitle: true,
      backgroundColor: kPrimaryColor,
      title: SizedBox( height: 100.0,
          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: <Widget>[
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: RaisedButton(
            elevation: 3.0,
            onPressed: () {
              showDialog(
                context: context,
                builder: (BuildContext context) {
                  return AlertDialog(
                      title: const Text('Select a color'),
                      content: SingleChildScrollView(
                        child: ColorPicker(
                          pickerColor: currentColor,
                          onColorChanged: selectColor,
                          showLabel: true,
                          pickerAreaHeightPercent: 1.0,
                          colorPickerWidth: 500,
                          pickerAreaBorderRadius:
                              const BorderRadius.all(Radius.circular(15.0)),
                        ),
                      ));
                },
              );
            },
            child: const Text('Colors'),
            color: currentColor,
            textColor: useWhiteForeground(currentColor)
                ? const Color(0xffffffff)
                : const Color(0xff000000),
          ),
        ),
        ListView.builder(
            scrollDirection: Axis.horizontal,
            shrinkWrap: true,
            itemCount: tools.length,
            itemBuilder: (context, index) => Container(
                color: currentTool == tools[index].type ? kContentColorLightTheme.withOpacity(0.2) : kPrimaryColor,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20.0, 0, 20.0, 0),
                  child: GestureDetector(
                    onTap: () {
                      selectTool(tools[index].type);
                    },
                    child: Icon(
                      tools[index].icon,
                      size: 26.0,
                    ),
                  ),
                ))),
      ],
    )));
  }
}
