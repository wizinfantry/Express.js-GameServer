const TFakeMoney = require('./FakeMoneyClass');
/**
 * Session library
 */
class TSession {
    constructor() {
        this._sessionList = {};
        this.sessionLoop(this);
    }
    //========================================================================================
    // 2차 gameSession 발행시 추가
    /**
     *
     * @param {String} gameSesssion
     * @param {Number} userId
     * @param {Number} payLines
     * @param {String} reelDB
     * @param {String} gameId
     * @param {Number} balance
     */
    sessionListAdd(gameSesssion, userId, payLines, reelDB, gameId, balance) {
        var _data = this._sessionList[gameSesssion] = {};
        _data.gameSesssion = gameSesssion;
        _data.userId = userId;
        _data.status = 'GameIdle';
        _data.time = Date.now();
        _data.freeGameList = [];
        _data.payLines = payLines;
        _data.reelDB = reelDB;
        _data.gameId = gameId;
        _data.balance = balance;
        _data.reelList = [];
        _data.bwm = 0;
        _data.nowBaseGameWin = 0;
        _data.newBaseGameWin = 0;
        _data.tb = 0;
        //========================================================================================
        // BetSize 파라메터 확인용
        _data.cs = [0.01, 0.04, 0.1];
        // BetLevel 파라메터 확인용
        _data.ml = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        //========================================================================================
        _data.ingotBet = 1;
        //========================================================================================
        // 2019.11.04 fakeMoney Add
        _data.fakeMoney = new TFakeMoney();
        //========================================================================================
    }

    // 사용하지 않는 세션 종료
    /**
     *
     * @param {String} gameSesssion
     */
    sessionListDel(gameSesssion) {
        if (this._sessionList[gameSesssion]) {
            this._sessionList[gameSesssion].gameSesssion = undefined;
            this._sessionList[gameSesssion].userId = undefined;
            this._sessionList[gameSesssion].status = undefined;
            this._sessionList[gameSesssion].time = undefined;
            this._sessionList[gameSesssion].freeGameList = undefined;
            this._sessionList[gameSesssion].payLines = undefined;
            this._sessionList[gameSesssion].reelDB = undefined;
            this._sessionList[gameSesssion].reelList = undefined;
            this._sessionList[gameSesssion].bwm = undefined;
            this._sessionList[gameSesssion].nowBaseGameWin = undefined;
            this._sessionList[gameSesssion].newBaseGameWin = undefined;
            this._sessionList[gameSesssion].tb = undefined;
            this._sessionList[gameSesssion].cs = undefined;
            this._sessionList[gameSesssion].ml = undefined;
            this._sessionList[gameSesssion].ingotBet = undefined;
            //========================================================================================
            // 2019.11.04 fakeMoney Add
            this._sessionList[gameSesssion].fakeMoney.destroy();
            //========================================================================================
            delete this._sessionList[gameSesssion];
        }
    }

    /**
     *
     * @param {String} gameSession
     * @return {Number} userId
     */
    getUserIdAtSessionList(gameSession) {
        if (this._sessionList[gameSession])
            return this._sessionList[gameSession].userId;
    }
    /**
     *
     * @param {String} gameSession
     * @param {Number} userId
     */
    setUserIdAtSessionList(gameSession, userId) {
        if (this._sessionList[gameSession])
            this._sessionList[gameSession].userId = userId;
    }

    getStatusAtSessionList(gameSession) {
        if (this._sessionList[gameSession])
            return this._sessionList[gameSession].status;
    }
    setStatusAtSessionList(gameSession, status) {
        if (this._sessionList[gameSession])
            this._sessionList[gameSession].status = status;
    }

    getTimeAtSessionList(gameSession) {
        if (this._sessionList[gameSession])
            return this._sessionList[gameSession].time;
    }
    setTimeAtSessionList(gameSession, time) {
        if (this._sessionList[gameSession])
            this._sessionList[gameSession].time = time;
    }

    initFreeGameListAtSessionList(gameSession) {
        if (this._sessionList[gameSession])
            this._sessionList[gameSession].freeGameList = [];
    }
    getFreeGameListAtSessionList(gameSession) {
        if (this._sessionList[gameSession])
            return this._sessionList[gameSession].freeGameList.shift();
    }
    setFreeGameListAtSessionList(gameSession, freeGamePacket) {
        if (this._sessionList[gameSession])
            this._sessionList[gameSession].freeGameList = freeGamePacket;
    }

    getPayLineAtSessionList(gameSession) {
        if (this._sessionList[gameSession])
            return this._sessionList[gameSession].payLines;
    }
    setPayLineAtSessionList(gameSession, payLines) {
        if (this._sessionList[gameSession])
            this._sessionList[gameSession].payLines = payLines;
    }

    getReelDBAtSessionList(gameSession) {
        if (this._sessionList[gameSession])
            return this._sessionList[gameSession].reelDB;
    }
    setReelDBAtSessionList(gameSession, reelDB) {
        if (this._sessionList[gameSession])
            this._sessionList[gameSession].reelDB = reelDB;
    }

    getGameIdAtSessionList(gameSession) {
        if (this._sessionList[gameSession])
            return this._sessionList[gameSession].gameId;
    }
    setGameIdAtSessionList(gameSession) {
        if (this._sessionList[gameSession])
            this._sessionList[gameSession].gameId = gameId;
    }

    getBalanceAtSessionList(gameSession) {
        if (this._sessionList[gameSession])
            return this._sessionList[gameSession].balance;
    }

    getReelListAtSessionList(gameSession) {
        if (this._sessionList[gameSession])
            return this._sessionList[gameSession].reelList;
    }
    setReelListAtSessionList(gameSession, reelList) {
        if (this._sessionList[gameSession])
            this._sessionList[gameSession].reelList = reelList;
    }

    getBwmAtSessionList(gameSession) {
        if (this._sessionList[gameSession])
            return this._sessionList[gameSession].bwm;
    }
    setBwmAtSessionList(gameSession, bwm) {
        if (this._sessionList[gameSession])
            this._sessionList[gameSession].bwm = bwm;
    }

    getNowBaseGameWinAtSessionList(gameSession) {
        if (this._sessionList[gameSession])
            return this._sessionList[gameSession].nowBaseGameWin;
    }
    setNowBaseGameWinAtSessionList(gameSession, nowBaseGameWin) {
        if (this._sessionList[gameSession])
            this._sessionList[gameSession].nowBaseGameWin = nowBaseGameWin;
    }

    getNewBaseGameWinAtSessionList(gameSession) {
        if (this._sessionList[gameSession])
            return this._sessionList[gameSession].newBaseGameWin;
    }
    setNewBaseGameWinAtSessionList(gameSession, newBaseGameWin) {
        if (this._sessionList[gameSession])
            this._sessionList[gameSession].newBaseGameWin = newBaseGameWin;
    }

    getTbAtSessionList(gameSession) {
        if (this._sessionList[gameSession])
            return this._sessionList[gameSession].tb;
    }
    setTbAtSessionList(gameSession, tb) {
        if (this._sessionList[gameSession])
            this._sessionList[gameSession].tb = tb;
    }

    getCsAtSessionList(gameSession) {
        if (this._sessionList[gameSession])
            return this._sessionList[gameSession].cs;
    }

    getMlAtSessionList(gameSession) {
        if (this._sessionList[gameSession])
            return this._sessionList[gameSession].ml;
    }

    getIngotBetAtSessionList(gameSession) {
        if (this._sessionList[gameSession]) {
            return this._sessionList[gameSession].ingotBet;
        }
    }
    setIngotBetAtSessionList(gameSession, bn) {
        if (this._sessionList[gameSession])
            this._sessionList[gameSession].ingotBet = bn;
    }

    getWinResultAtSessionList(gameSession) {
        if (this._sessionList[gameSession]) {
            return this._sessionList[gameSession].fakeMoney.getWinResult();
        }
    }

    getWinMoneyAtSessionList(gameSession, params) {
        if (this._sessionList[gameSession]) {
            console.log('getWinMoneyAtSessionList params', params);
            var _payLines = this.getPayLineAtSessionList(gameSession);
            console.log('getWinMoneyAtSessionList payLines', _payLines);
            // var _wager = parseInt((parseFloat((params.betSize * params.betLevel * _payLines).toFixed(2))) * 100);
            var _wager = parseFloat((params.betSize * params.betLevel * _payLines).toFixed(2));
            console.log('getWinMoneyAtSessionList _wager', _wager);
            return this._sessionList[gameSession].fakeMoney.getWinMoney(_wager);
        }
    }

    setLoseCountAtSessionList(gameSession, count) {
        if (this._sessionList[gameSession]) {
            return this._sessionList[gameSession].fakeMoney.setLoseCount(count);
        }
    }


    // 사용하지 않는 세션을 시간별로 확인하여 삭제
    removeAtSessionList() {
        var _self = this;
        var _value = 60 * 1000 * 10;
        for (var _key in this._sessionList) {
            if (this._sessionList[_key].time + _value < Date.now()) {
                console.log('removeAtSessionList', _key);
                this.sessionListDel(_key);
            }
        }
        // console.log('removeAtSessionList..')
        _self.sessionLoop(_self);
    }

    sessionLoop(self) {
        var _self = self;
        setTimeout(_self.removeAtSessionList.bind(_self), 10000);
    }
    //========================================================================================
}

module.exports = TSession;