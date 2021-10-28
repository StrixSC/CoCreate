import 'package:Colorimage/models/user.dart';
import 'package:flutter/material.dart';
import 'dart:convert' as convert;
import 'package:http/http.dart' as http;
import './channel_list.dart';
import '../../constants/general.dart';

  class ChannelScreen extends StatefulWidget {
    final User user;
    ChannelScreen(this.user);
    @override
    _ChannelScreenState createState() => _ChannelScreenState(user: this.user);
  }

  class _ChannelScreenState extends State<ChannelScreen> {
    _ChannelScreenState({
      required this.user,
    });

    final User user;

    @override
    initState() {
      super.initState();
    }

    @override
    Widget build(BuildContext context) {
      return Scaffold(
        // appBar: buildAppBar(),
        body: ChannelListView(user),
      );
    }

  }
