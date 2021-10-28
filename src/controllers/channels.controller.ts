import { IReceiveMessagePayload } from './../models/IReceiveMessagePayload.model';
import { handleRequestError } from '../utils/errors';
import create from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import {
  createChannel,
  getAllChannels,
  getChannelById,
  getChannelMessagesById
} from './../services/channels.service';
import { Request, Response, NextFunction } from 'express';
import { matchedData, validationResult } from 'express-validator';
import moment from 'moment';

export const getAllChannelsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const channels = await getAllChannels();
    if (channels.length === 0) return res.status(StatusCodes.NO_CONTENT).json([]);

    return res.status(StatusCodes.OK).json(channels);
  } catch (e) {
    handleRequestError(e, next);
  }
};

export const getChannelByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req).array();
    if (errors.length > 0) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: errors
      });
    }
    const paramsData = matchedData(req, { locations: [ 'params' ] });

    const info = await getChannelById(paramsData.id);
    if (!info) {
      res.status(StatusCodes.NO_CONTENT).json({});
    } else {
      res.status(StatusCodes.OK).json(info);
    }
  } catch (e: any) {
    handleRequestError(e, next);
  }
};

export const createChannelController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req).array();
    if (errors.length > 0) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: errors
      });
    }
    const bodyData = matchedData(req, { locations: [ 'body' ] });

    const result = await createChannel(bodyData.name, req.user!.user_id);
    if (!result) throw new create.InternalServerError();
    res.status(StatusCodes.CREATED).json({
      message: `Success! Channel ${result.channel} was created successfully.`
    });
  } catch (e: any) {
    handleRequestError(e, next);
  }
};

export const getChannelMessagesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req).array();
    if (errors.length > 0) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: errors
      });
    }
    const paramsData = matchedData(req, { locations: [ 'params' ] });

    const messages = await getChannelMessagesById(paramsData.id);
    if (!messages)
      throw new create.InternalServerError('Could not fetch messages for the given id');

    const returnMessages = [] as IReceiveMessagePayload[];
    messages.forEach((m) => {
      returnMessages.push({
        message_data: m.message_data,
        avatar_url: m.sender.member.profile!.avatar_url || '',
        message_id: m.message_id,
        sender_profile_id: m.sender.member.profile!.user_id,
        timestamp: moment(m.created_at).format('HH:mm:ss'),
        username: m.sender.member.profile!.username
      });
    });

    res.status(StatusCodes.OK).json(returnMessages);
  } catch (e) {
    handleRequestError(e, next);
  }
};
