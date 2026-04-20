import { answerSheetQuestion } from '../services/chat.service.js';

export async function askSheetQuestion(req, res, next) {
  try {
    const message = req.body?.message;
    if (!message) return res.status(400).json({ message: 'message is required.' });
    res.json(await answerSheetQuestion(req.params.id, message));
  } catch (error) { next(error); }
}
