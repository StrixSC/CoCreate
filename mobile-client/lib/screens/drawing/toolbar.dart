import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/models/drawing.dart';
import 'package:Colorimage/models/tool.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';

class Toolbar extends StatefulWidget {
  Function changeTool;
  Function changeColor;
  Function changeWidth;

  Toolbar(this.changeTool, this.changeColor, this.changeWidth);

  @override
  State<Toolbar> createState() =>
      _ToolbarState(this.changeTool, this.changeColor, this.changeWidth);
}

class _ToolbarState extends State<Toolbar> {
  Function changeTool;
  Function changeColor;
  Function changeWidth;

  Color currentBodyColor = const Color(0xff443a49);
  Color currentBorderColor = const Color(0xff443a49);
  Color currentBackgroundColor = Colors.blueGrey;
  Color? tempColor;
  Color? tempColor2;
  String currentTool = '';
  double currentWidth = 5;
  double? tempWidth;

  final tools = [
    Tool(DrawingType.freedraw, CupertinoIcons.hand_draw_fill),
    Tool(DrawingType.ellipse, CupertinoIcons.circle),
    Tool(DrawingType.rectangle, CupertinoIcons.rectangle),
    Tool("select", CupertinoIcons.hand_raised_fill),
    Tool("strokeWidth", Icons.height),
    Tool("Colors", CupertinoIcons.bold),
  ];

  _ToolbarState(this.changeTool, this.changeColor, this.changeWidth);

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

  void selectTool(String type) {
    currentTool = type;
    changeTool(currentTool);
  }

  void selectWidth(double width) {
    currentWidth = width;
    changeWidth(currentWidth);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: ListView.builder(
        itemCount: tools.length,
        itemBuilder: (context, index) => index < 5
            ? Padding(
                padding: const EdgeInsets.fromLTRB(0, 15, 0, 15),
                child: ElevatedButton(
                  style: ButtonStyle(
                    backgroundColor: MaterialStateProperty.all(
                        currentTool == tools[index].type
                            ? kContentColor.withOpacity(0.5)
                            : Colors.transparent),
                    fixedSize: MaterialStateProperty.all(const Size(80, 57)),
                  ),
                  onPressed: () {
                    if (tools[index].type == "strokeWidth") {
                      showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return AlertDialog(
                            title: const Text("Choisir une épaisseur de trait"),
                            content: Slider(
                              min: 1.0,
                              max: 30.0,
                              label: (tempWidth != null)
                                  ? tempWidth!.toString()
                                  : currentWidth.toString(),
                              divisions: 29,
                              onChanged: (double width) {
                                tempWidth = width;
                              },
                              value: (tempWidth != null)
                                  ? tempWidth!
                                  : currentWidth,
                            ),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  tempWidth ??= currentWidth;
                                  selectWidth(tempWidth!);
                                  tempWidth = null;
                                  Navigator.pop(context, 'Choisir');
                                },
                                child: const Text('Choisir'),
                              ),
                            ],
                          );
                        },
                      );
                    }
                    selectTool(tools[index].type);
                  },
                  child: Icon(
                    tools[index].icon,
                    size: 32.0,
                    color: Colors.white,
                  ),
                ),
              )
            : drawingColorPicker(),
      ),
    );
  }

  drawingColorPicker() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 15, 0, 15),
      child: DecoratedBox(
        decoration: BoxDecoration(
          backgroundBlendMode: BlendMode.srcATop,
          gradient:
              LinearGradient(colors: [currentBodyColor, currentBorderColor]),
        ),
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
                        pickerColor:
                            (tempColor != null) ? tempColor! : currentBodyColor,
                        onColorChanged: (pickerColor) {
                          tempColor = pickerColor;
                        },
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
                        pickerColor: (tempColor2 != null)
                            ? tempColor2!
                            : currentBorderColor,
                        onColorChanged: (pickerColor) {
                          tempColor2 = pickerColor;
                        },
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
                        tempColor ??= currentBodyColor;
                        tempColor2 ??= currentBorderColor;
                        selectBodyColor(tempColor!);
                        selectBorderColor(tempColor2!);
                        tempColor = null;
                        tempColor2 = null;
                        Navigator.pop(context, 'Choisir');
                      },
                      child: const Text('Choisir'),
                    ),
                  ],
                );
              },
            );
          },
          child: const Text(
            'Couleurs',
            style: TextStyle(fontSize: 17, wordSpacing: 20),
            textAlign: TextAlign.center,
          ),
          style: ButtonStyle(
            fixedSize: MaterialStateProperty.all(Size(80, 57)),
            backgroundColor: MaterialStateProperty.all(Colors.transparent),
            foregroundColor: MaterialStateProperty.all(
                useWhiteForeground(currentBodyColor)
                    ? const Color(0xffffffff)
                    : const Color(0xff000000)),
          ),
        ),
      ),
    );
  }
}
