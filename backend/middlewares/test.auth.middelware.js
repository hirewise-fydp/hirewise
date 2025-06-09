
import { verifyTestToken } from '../services/tokenService.js';
import { CandidateApplication } from '../models/candidate.model.js';

export const verifyTestAccess = async (req, res, next) => {
  const token = req.query.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  const decoded = verifyTestToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid/expired token' });
  }

  const application = await CandidateApplication.findById(decoded.applicationId);
  if (!application || application.status !== 'test_invited') {
    return res.status(403).json({ error: 'Test not available' });
  }

  req.application = application;
  next();
};