import { Router } from 'express';
import express from 'express';
import { askSheetQuestion } from '../controllers/chat.controller.js';

const router = Router();
router.use(express.json());
router.post('/:id/chat', askSheetQuestion);
export default router;
