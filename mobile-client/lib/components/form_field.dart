import 'package:Colorimage/screens/galerie/galerie.dart';
import 'package:flutter/material.dart';

const _fontSize = 20.0;

formField(String hintText, String label) {
  return TextFormField(
    obscureText: hintText == 'Mot de passe',
    enableSuggestions: hintText != 'Mot de passe',
    style: const TextStyle(fontSize: _fontSize),
    keyboardType: hintText == 'Nombre de membres maximum'
        ? TextInputType.number
        : TextInputType.text,
    maxLines: 1,
    autofocus: false,
    decoration: InputDecoration(
      errorStyle: const TextStyle(fontSize: _fontSize),
      hintText: hintText,
      hintStyle: const TextStyle(
        fontSize: _fontSize,
      ),
      contentPadding: const EdgeInsets.all(padding),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(3.0)),
    ),
    autovalidate: true,
  );
}