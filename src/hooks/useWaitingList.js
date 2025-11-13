import { useState, useCallback } from "react";
import * as waitingListService from "../services/waitingListService";

/**
 * Hook quản lý waiting list
 */
export default function useWaitingList() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [waitingLists, setWaitingLists] = useState(null);
  const [waitingList, setWaitingList] = useState(null);

  const wrap = useCallback(async (fn, setResult) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn();
      if (typeof setResult === "function") setResult(res);
      setLoading(false);
      return res;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Add to waiting list
   */
  const addToWaitingList = useCallback(
    async (chargingPostId) => {
      return wrap(() => waitingListService.addToWaitingList(chargingPostId));
    },
    [wrap]
  );

  /**
   * Cancel waiting list
   */
  const cancelWaitingList = useCallback(
    async (waitingListId) => {
      const result = await wrap(() =>
        waitingListService.cancelWaitingList(waitingListId)
      );
      return result;
    },
    [wrap]
  );

  /**
   * Fetch waiting list by post
   */
  const fetchWaitingListByPost = useCallback(
    async (chargingPostId) => {
      return wrap(
        () => waitingListService.getWaitingListByPost(chargingPostId),
        setWaitingLists
      );
    },
    [wrap]
  );

  /**
   * Fetch waiting list by station
   */
  const fetchWaitingListByStation = useCallback(
    async (chargingStationId) => {
      return wrap(
        () => waitingListService.getWaitingListByStation(chargingStationId),
        setWaitingLists
      );
    },
    [wrap]
  );

  /**
   * Fetch waiting list by user
   */
  const fetchWaitingListByUser = useCallback(
    async (userId) => {
      console.log(
        "🔍 [useWaitingList] Fetching waiting list for userId:",
        userId
      );
      const result = await wrap(
        () => waitingListService.getWaitingListByUser(userId),
        setWaitingLists
      );
      return result;
    },
    [wrap]
  );

  /**
   * Fetch waiting list by date
   */
  const fetchWaitingListByDate = useCallback(
    async (date) => {
      return wrap(
        () => waitingListService.getWaitingListByDate(date),
        setWaitingLists
      );
    },
    [wrap]
  );

  /**
   * Fetch waiting list by ID
   */
  const fetchWaitingListById = useCallback(
    async (waitingListId) => {
      return wrap(
        () => waitingListService.getWaitingListById(waitingListId),
        setWaitingList
      );
    },
    [wrap]
  );

  const clear = useCallback(() => {
    setLoading(false);
    setError(null);
    setWaitingLists(null);
    setWaitingList(null);
  }, []);

  /**
   * Accept early charging offer
   */
  const acceptEarlyChargingOffer = useCallback(
    async (userId, chargingPostId) => {
      return wrap(() =>
        waitingListService.acceptEarlyCharging(userId, chargingPostId)
      );
    },
    [wrap]
  );

  /**
   * Decline early charging offer
   */
  const declineEarlyChargingOffer = useCallback(
    async (userId, chargingPostId) => {
      console.log("⏰ [useWaitingList] Declining early charging offer");
      return wrap(() =>
        waitingListService.declineEarlyCharging(userId, chargingPostId)
      );
    },
    [wrap]
  );

  return {
    loading,
    error,
    waitingLists,
    waitingList,
    addToWaitingList,
    cancelWaitingList,
    fetchWaitingListByPost,
    fetchWaitingListByStation,
    fetchWaitingListByUser,
    fetchWaitingListByDate,
    fetchWaitingListById,
    acceptEarlyChargingOffer,
    declineEarlyChargingOffer,
    clear,
  };
}
