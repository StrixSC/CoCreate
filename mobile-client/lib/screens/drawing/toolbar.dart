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

  Color currentBodyColor = const Color(0xff443a49);
  Color currentBorderColor = const Color(0xff443a49);
  Color currentBackgroundColor = Colors.blueGrey;
  String currentTool = '';

  final tools = [
    Tool(DrawingType.freedraw, CupertinoIcons.hand_draw_fill),
    Tool("select", CupertinoIcons.hand_raised_fill),
    Tool("rotate", CupertinoIcons.arrow_clockwise),
    Tool(DrawingType.ellipse, CupertinoIcons.circle),
    Tool(DrawingType.rectangle, CupertinoIcons.rectangle),
    Tool("Colors", CupertinoIcons.bold),
  ];

  _ToolbarState(this.changeTool, this.changeColor);

  // ValueChanged<Color> callback
  void selectBodyColor(Color color) {
    currentBodyColor = color;
    changeColor(color, "Body");
  }

  void selectBorderColor(Color color) {
    currentBorderColor = color;
    changeColor(color, "Border");
  }

  void selectBackgroundColor(Color color) {
    currentBackgroundColor = color;
    changeColor(color, "Background");
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
              child: Padding(
                  padding: const EdgeInsets.fromLTRB(0.0, 50.0, 0.0, 0.0),
                  child: Container(
                      color: Colors.white24,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: <Widget>[
                          Expanded(
                              child: ListView.builder(
                            itemCount: tools.length,
                            itemBuilder: (context, index) => index < 5
                                ? Container(
                                    color: currentTool == tools[index].type
                                        ? kContentColorLightTheme
                                            .withOpacity(0.2)
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
                                    ))
                                : drawingColorPicker(),
                          )),
                        ],
                      )))))
    ]);
  }

  drawingColorPicker() {
    return Column(children: [
    DecoratedBox(
    decoration: BoxDecoration(
      backgroundBlendMode: BlendMode.srcATop,
    gradient: LinearGradient(colors: [currentBodyColor, currentBorderColor]),
    ),
    child: Container(// min sizes for Material buttons
    alignment: Alignment.center,
    child: ElevatedButton(
          onPressed: () {
            showDialog(
              context: context,
              builder: (BuildContext context) {
                return AlertDialog(
                  content: SingleChildScrollView(
                    child: Column(children: [
                      const Text('Choisir une couleur de corps',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 20.0),
                      ColorPicker(
                        pickerColor: currentBodyColor,
                        onColorChanged: selectBodyColor,
                        showLabel: true,
                        pickerAreaHeightPercent: 0.4,
                        colorPickerWidth: 500,
                        pickerAreaBorderRadius:
                            const BorderRadius.all(Radius.circular(15.0)),
                      ),
                      const SizedBox(height: 20.0),
                      const Text('Choisir une couleur de bordure',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 20.0),
                      ColorPicker(
                        pickerColor: currentBorderColor,
                        onColorChanged: selectBorderColor,
                        showLabel: true,
                        pickerAreaHeightPercent: 0.4,
                        colorPickerWidth: 500,
                        pickerAreaBorderRadius:
                            const BorderRadius.all(Radius.circular(15.0)),
                      )
                    ]),
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
          child: const Text('D'),
          style: ButtonStyle(
            elevation: MaterialStateProperty.all(0.0),
            backgroundColor: MaterialStateProperty.all(Colors.transparent),
            textStyle: MaterialStateProperty.all(
              TextStyle(
                color: useWhiteForeground(currentBodyColor)
                    ? const Color(0xff000000)
                    : const Color(0xffffffff),
                fontSize: 26.0,
              ),
            ),
            fixedSize: MaterialStateProperty.all(const Size(10, 60)),
          )))),
      const SizedBox(height: 20.0),
      DecoratedBox(
    decoration: BoxDecoration(
    backgroundBlendMode: BlendMode.srcATop,
    gradient: LinearGradient(colors: [currentBackgroundColor, currentBackgroundColor]),
    ),
    child: Container(// min sizes for Material buttons
    alignment: Alignment.center,
    child:ElevatedButton(
          onPressed: () {
            showDialog(
              context: context,
              builder: (BuildContext context) {
                return AlertDialog(
                  content: SingleChildScrollView(
                      child: Column(
                    children: [
                      const Text(
                        'Choisir une couleur de fond',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 20.0),
                      ColorPicker(
                        pickerColor: currentBackgroundColor,
                        onColorChanged: selectBackgroundColor,
                        showLabel: true,
                        pickerAreaHeightPercent: 1.0,
                        colorPickerWidth: 500,
                        pickerAreaBorderRadius:
                            const BorderRadius.all(Radius.circular(15.0)),
                      )
                    ],
                  )),
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
            elevation: MaterialStateProperty.all(0.0),
            backgroundColor: MaterialStateProperty.all(Colors.transparent),
            textStyle: MaterialStateProperty.all(
              TextStyle(
                color: useWhiteForeground(currentBodyColor)
                    ? const Color(0xff000000)
                    : const Color(0xffffffff),
                fontSize: 26.0,
              ),
            ),
            fixedSize: MaterialStateProperty.all(const Size(10, 60)),
          )),
    ))]);
  }
}
