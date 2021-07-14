class TDBFakeMoney {
    constructor() {
    }

    static create() {
        var fakeMoneyObject = {};
        fakeMoneyObject.minBet = 0.50;
        this.initWinCountList(fakeMoneyObject);
        this.initWinMoneyList(fakeMoneyObject);
        this.initLostCount(fakeMoneyObject);
        return fakeMoneyObject;
    }

    static destroy(fakeMoneyObject) {
        if (fakeMoneyObject) {
            fakeMoneyObject.winCountList = undefined;
            fakeMoneyObject.winMoneyList = undefined;
            fakeMoneyObject.loseCount = undefined;
        }
    }

    static initWinCountList(fakeMoneyObject) {
        if (fakeMoneyObject) {
            fakeMoneyObject.winCountList = null;
            fakeMoneyObject.winCountList = this.getShuffleWinCountList();
        }
    }

    static initWinMoneyList(fakeMoneyObject) {
        if (fakeMoneyObject) {
            fakeMoneyObject.winMoneyList = null;
            fakeMoneyObject.winMoneyList = this.getShuffleWinMoneyList();
        }
    }

    static getShuffleWinCountList() {
        // 당첨구간리스트 셔플
        // 1,2,3,4,5
        var _array = [4, 5, 6, 7, 8];
        return _array.map((a) => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map((a) => a[1]);
    }

    static getWinCount(fakeMoneyObject) {
        if (fakeMoneyObject)
            return fakeMoneyObject.winCountList[0];
    }
    static setWinCount(fakeMoneyObject) {
        if (fakeMoneyObject) {
            fakeMoneyObject.winCountList.shift();
            if (fakeMoneyObject.winCountList.length == 0) {
                this.initWinCountList(fakeMoneyObject);
            }
        }
    }

    static getShuffleWinMoneyList() {
        // 당첨금배율 셔플
        // 0.1, 0.2, 0.3, 0.4, 0.5
        var _array = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, -0.1, -0.2, -0.3, -0.4, -0.5];
        return _array.map((a) => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map((a) => a[1]);
    }

    static getWinMoney(fakeMoneyObject, wager) {
        if (fakeMoneyObject) {
            // 당첨금액확인
            console.log('getWinMoney wager', wager);
            var _rate = fakeMoneyObject.winMoneyList.shift();
            var _multi = parseFloat(wager / fakeMoneyObject.minBet);
            var _winMoney = parseFloat(wager + (wager * _rate)) * 100;
            _winMoney = parseInt(_winMoney / _multi);
            if (fakeMoneyObject.winMoneyList.length == 0) {
                this.initWinMoneyList(fakeMoneyObject);
            }
            console.log('getWinMoney _winMoney', _winMoney);
            return _winMoney;
        }
    }

    static initLostCount(fakeMoneyObject) {
        if (fakeMoneyObject)
            fakeMoneyObject.loseCount = 0;
    }

    static getLoseCount(fakeMoneyObject) {
        if (fakeMoneyObject)
            return fakeMoneyObject.loseCount;
    }
    static addLoseCount(fakeMoneyObject) {
        if (fakeMoneyObject)
            fakeMoneyObject.loseCount++;
    }
    static setLoseCount(fakeMoneyObject, count) {
        if (fakeMoneyObject)
            fakeMoneyObject.loseCount = count;
    }

    static getWinResult(fakeMoneyObject) {
        if (fakeMoneyObject) {
            // 게임결과확인
            var _loseCount = this.getLoseCount(fakeMoneyObject);
            var _winCount = this.getWinCount(fakeMoneyObject);
            console.log('getWinResult _loseCount', _loseCount);
            console.log('getWinResult _winCount', _winCount);
            this.addLoseCount(fakeMoneyObject);
            if (_loseCount >= _winCount) {
                this.setWinCount(fakeMoneyObject);
                this.setLoseCount(fakeMoneyObject, 0);
                return true;
            } else {
                return false;
            }
        }
    }
}

module.exports = TDBFakeMoney;