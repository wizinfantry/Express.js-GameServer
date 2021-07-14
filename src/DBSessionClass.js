const TDBFakeMoney = require('./DBFakeMoneyClass');
/**
 * Session library
 */
class TDBSession {
    constructor() {
    }
    //========================================================================================
    // 2차 gameSession 발행시 추가
    static getSessionData(gameSession, userId, payLines, reelDB, gameId, balance) {
        // var _data = data = {};
        var _data = {};
        _data.gameSession = gameSession;
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
        _data.fakeMoneyObject = TDBFakeMoney.create();
        //========================================================================================
        // 2019.11.29 gambleOrTakeList Add
        _data.gambleOrTakeList = [];
        // 2019.11.29 roundId Add
        _data.roundId = undefined;
        // 2019.11.29 params Add
        _data.params = undefined;
        //========================================================================================
        //!========================================================================================
        //! 2020.04.03 추가분
        _data.oldml = 0;
        _data.oldcs = 0;
        //!========================================================================================
        return _data;
    }

    static getUserIdAtData(data) {
        if (data)
            return data.userId;
    }
    static setUserIdAtData(data, userId) {
        if (data)
            data.userId = userId;
    }

    static getStatusAtData(data) {
        if (data)
            return data.status;
    }
    static setStatusAtData(data, status) {
        if (data)
            data.status = status;
    }

    static getTimeAtData(data) {
        if (data)
            return data.time;
    }
    static setTimeAtData(data, time) {
        if (data)
            data.time = time;
    }

    static initFreeGameListAtData(data) {
        if (data)
            data.freeGameList = [];
    }
    static getFreeGameListAtData(data) {
        if (data)
            return data.freeGameList.shift();
    }
    static setFreeGameListAtData(data, freeGamePacket) {
        if (data)
            data.freeGameList = freeGamePacket;
    }

    static getPayLineAtData(data) {
        if (data)
            return data.payLines;
    }
    static setPayLineAtData(data, payLines) {
        if (data)
            data.payLines = payLines;
    }

    static getReelDBAtData(data) {
        if (data)
            return data.reelDB;
    }
    static setReelDBAtData(data, reelDB) {
        if (data)
            data.reelDB = reelDB;
    }

    static getGameIdAtData(data) {
        if (data)
            return data.gameId;
    }
    static setGameIdAtData(data, gameId) {
        if (data)
            data.gameId = gameId;
    }

    static getBalanceAtData(data) {
        if (data)
            return data.balance;
    }

    static getReelListAtData(data) {
        if (data)
            return data.reelList;
    }
    static setReelListAtData(data, reelList) {
        if (data)
            data.reelList = reelList;
    }

    static getBwmAtData(data) {
        if (data)
            return data.bwm;
    }
    static setBwmAtData(data, bwm) {
        if (data)
            data.bwm = bwm;
    }

    static getNowBaseGameWinAtData(data) {
        if (data)
            return data.nowBaseGameWin;
    }
    static setNowBaseGameWinAtData(data, nowBaseGameWin) {
        if (data)
            data.nowBaseGameWin = nowBaseGameWin;
    }

    static getNewBaseGameWinAtData(data) {
        if (data)
            return data.newBaseGameWin;
    }
    static setNewBaseGameWinAtData(data, newBaseGameWin) {
        if (data)
            data.newBaseGameWin = newBaseGameWin;
    }

    static getTbAtData(data) {
        if (data)
            return data.tb;
    }
    static setTbAtData(data, tb) {
        if (data)
            data.tb = tb;
    }

    static getCsAtData(data) {
        if (data)
            return data.cs;
    }

    static getMlAtData(data) {
        if (data)
            return data.ml;
    }

    //? ====================================================
	static getOldCsAtData(data) {
		if (data)
			return data.oldcs;
	}
	static setOldCsAtData(data, cs) {
		if (data) {
			data.oldcs = cs;
		}
	}

	static getOldMlAtData(data) {
		if (data)
			return data.oldml;
	}
	static setOldMlAtData(data, ml) {
		if (data) {
			data.oldml = ml;
		}
	}
	//? ====================================================

    static getIngotBetAtData(data) {
        if (data) {
            return data.ingotBet;
        }
    }
    static setIngotBetAtData(data, bn) {
        if (data)
            data.ingotBet = bn;
    }

    static getWinResultAtData(data) {
        if (data) {
            return TDBFakeMoney.getWinResult(data.fakeMoneyObject);
        }
    }

    static getWinMoneyAtData(data, params) {
        if (data) {
            console.log('getWinMoneyAtData params', params);
            var _payLines = this.getPayLineAtData(data);
            console.log('getWinMoneyAtData payLines', _payLines);
            // var _wager = parseInt((parseFloat((params.betSize * params.betLevel * _payLines).toFixed(2))) * 100);
            var _wager = parseFloat((params.betSize * params.betLevel * _payLines).toFixed(2));
            console.log('getWinMoneyAtData _wager', _wager);
            return  TDBFakeMoney.getWinMoney(data.fakeMoneyObject, _wager);
        }
    }

    static setLoseCountAtData(data, count) {
        if (data) {
            return TDBFakeMoney.setLoseCount(data.fakeMoneyObject, count);
        }
    }

    static initGambleOrTakeListAtData(data) {
        if (data)
            data.gambleOrTakeList = [];
    }
    static getGambleOrTakeListAtData(data) {
        if (data)
            return data.gambleOrTakeList.shift();
    }
    static setGambleOrTakeListAtData(data, gambleOrTakePacket) {
        if (data)
            data.gambleOrTakeList = gambleOrTakePacket;
    }

    static getRoundIdAtData(data) {
        if (data)
            return data.roundId;
    }
    static setRoundIdAtData(data, roundId) {
        if (data)
            data.roundId = roundId;
    }

    static getParamsAtData(data) {
        if (data)
            return data.params;
    }
    static setParamsAtData(data, params) {
        if (data) {
            data.params = undefined;
            data.params = params;
        }
    }
    //========================================================================================
}

module.exports = TDBSession;