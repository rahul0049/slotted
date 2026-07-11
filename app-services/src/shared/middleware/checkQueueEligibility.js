import { checkEligible } from '../queueClient.js';

export const checkQueueEligibility = (getProviderId) => {
  return async (req, res, next) => {
    try {
      const providerId = getProviderId(req);
      const userId = req.user.id;

      const { eligible } = await checkEligible(providerId, userId);

      if (!eligible) {
        return res.status(403).json({
          error: 'You are not yet eligible to book — please wait for your queue position',
        });
      }

      next();
    } catch (err) {

      res.status(503).json({ error: 'Queue service unavailable' });
    }
  };
};