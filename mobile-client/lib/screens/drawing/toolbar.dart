import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/models/drawing.dart';
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
    Tool(DrawingType.freedraw, CupertinoIcons.hand_draw_fill),
    Tool("select", CupertinoIcons.hand_raised_fill),
    Tool("rotate", CupertinoIcons.arrow_clockwise),
    Tool(DrawingType.ellipse, CupertinoIcons.circle),
    Tool(DrawingType.rectangle, CupertinoIcons.rectangle)
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
    return Column(children: [
      SizedBox(
          width: 80,
          height: MediaQuery.of(context).size.height,
          child: Drawer(
              elevation: 18,
              child: Container(
                  color: Colors.white24,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: <Widget>[
                      Expanded(child: colorPicker()),
                      Expanded(
                          child: ListView.builder(
                              itemCount: tools.length,
                              itemBuilder: (context, index) => Container(
                                  color: currentTool == tools[index].type
                                      ? kContentColorLightTheme.withOpacity(0.2)
                                      : Colors.white24,
                                  child: Padding(
                                    padding: const EdgeInsets.fromLTRB(
                                        0, 20.0, 0, 20.0),
                                    child: GestureDetector(
                                      onTap: () {
                                        selectTool(tools[index].type);
                                      },
                                      child: Icon(
                                        tools[index].icon,
                                        size: 32.0,
                                      ),
                                    ),
                                  )))),
                    ],
                  ))))
    ]);
  }

  colorPicker() {
    return Row(
        mainAxisSize: MainAxisSize.values.last,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          ConstrainedBox(
              constraints: BoxConstraints.tightFor(
                  width: MediaQuery.of(context).size.width * 0.07, height: 50),
              child: ElevatedButton(
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return AlertDialog(
                          title: const Text('Choisir une couleur de trait'),
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
                          ),
                          actions: <Widget>[
                            TextButton(
                              onPressed: () {
                                Navigator.pop(context, 'Choisir');
                              },
                              child: const Text('Choisir'),
                            ),
                          ],
                        );
                      },
                    );
                  },
                  child: const Text('B'),
                  style: ButtonStyle(
                    backgroundColor: MaterialStateProperty.all(currentColor),
                    textStyle: MaterialStateProperty.all(
                      TextStyle(
                          color: useWhiteForeground(currentColor)
                              ? const Color(0xff000000)
                              : const Color(0xffffffff)),
                    ),
                  )))
        ]);
  }

}
