const express = require('express');
const session = require('express-session');
const mySqlStore = require('express-mysql-session');
const TDBSession = require('./DBSessionClass');
class TGameServer {
    constructor() {
        this._reelCon = require('../config/reelPool');
        this._gameCon = require('../config/gamePool');
        this._app = express();

        this._app.use(session({
            secret: 'secret',
            resave: false,
            saveUninitialized : false,
            rolling: true,
            cookie: {
                expires: new Date(Date.now() + (1000 * 60 * 10)),
                maxAge: 1000 * 60 * 10,
            },
            store: new mySqlStore({
                host: 'localhost',
                user: 'user',
                password: 'password',
                database: 'database',
                // checkExpirationInterval: 1000 * 60 * 2
                // createDatabaseTable: true
            })
        }));


        this._app.use(express.json());
        this._app.use(express.urlencoded({
            extended: false
        }));
        this._app.use(express.static('../'));
        this._roundId = 1;

        this._app.post('/web-api/auth/session/v1/verifyOperatorPlayerSession', this.verifyOperatorPlayerSession.bind(this));
        this._app.post('/web-api/auth/session/v1/verifySession', this.verifyOperatorPlayerSession.bind(this));
        this._app.post('/web-api/auth/Game/v1/GetDeviceBenchmark', this.getDeviceBenchmark.bind(this));
        this._app.post('/game-api/#######/v2/GameInfo/Get', this.gameInfoGet.bind(this));
        this._app.post('/web-api/game-proxy/v2/GameName/Get', this.gameNameGet.bind(this));
        this._app.post('/web-api/game-proxy/v2/Resources/GetByResourcesTypeIds', this.getByResourcesTypeIds.bind(this));

        this._app.post('/game-api/#######/v2/Spin', this.spin.bind(this));
        this._app.post('/web-api/game-proxy/v2/GameRule/Get', this.gameRuleGet.bind(this));

        this._app.post('/game-api/#######/v2/selectcharacter', this.selectcharacter.bind(this));

        this._app.listen(15022, () => {
            console.log('Example app listening on port 15022!');
        });

    }

    getRoundId() {
        return this._roundId++;
    }

    makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    makeErrorPacket(cd, msg) {
        var _packet = {};
        _packet.dt = null;
        _packet.err = {};
        _packet.err.cd = cd;
        _packet.err.msg = msg;
        _packet.err.tid = this.makeid(8);
        return JSON.stringify(_packet);
    }

    betParamCheck(paramList, param) {
        if (paramList) {
            for (var i = 0; i < paramList.length; i++) {
                if (paramList[i] == param) {
                    return true;
                }
            }
        }
        return false;
    }

    //========================================================================================
    // 1차 gameToken 확인 및 2차 gameSession발행, 접속 세션 정리
    //========================================================================================
    verifyOperatorPlayerSession(req, res) {
        var _gameToken = req.body.os;
        this.verifyOperatorPlayerSessionQuery(req, res, _gameToken, this._reelCon, this._gameCon);
    }
    verifyOperatorPlayerSessionQuery(req, res, gameToken, reelCon, gameCon) {
        var _result = {}; {
            var _sql = 'CALL VerifyOperatorPlayerSession(?)';
            var _para = gameToken;
            gameCon.query(_sql, _para, (error, results, fields) => {
                if (error || results[0].length == 0) {
                    return res.send(this.makeErrorPacket('1000', 'VerifyOperatorPlayerSession ERROR'));
                } else {
                    var _data = results[0];
                    if (_data[0].status == 'ok') {
                        req.session.data = {};
                        req.session.data = TDBSession.getSessionData(_data[0].gameSession, _data[0].userId, _data[0].payLines, _data[0].reelDB, _data[0].gameId, _data[0].balance);
                        // ============================================================================
                        req.session.cookie.expires = new Date(Date.now() + (1000 * 60 * 10));
                        req.session.save(()=>{
                            return res.send(this.verifyOperatorPlayerSessionPacket(_data));
                        });
                    } else {
                        return res.send(this.makeErrorPacket('1001', 'VerifyOperatorPlayerSession ERROR'));
                    }
                }
            });
        }
    }
    verifyOperatorPlayerSessionPacket(data) {
        var _sendData = {};
        _sendData.dt = {};

        _sendData.dt.oj = {};
        _sendData.dt.oj.jid = 0;

        _sendData.dt.pcd = data[0].userId;
        _sendData.dt.pid = '@@@@@@@@@@';
        _sendData.dt.tk = data[0].gameSession;
        _sendData.dt.st = 1;

        _sendData.dt.geu = 'http://localhost:15022/game-api/#######/';
        _sendData.dt.lau = 'game-api/lobby/';
        _sendData.dt.bau = 'web-api/game-proxy/';
        _sendData.dt.cc = 'CCC';
        _sendData.dt.cs = '';

        _sendData.dt.gm = [];
        _sendData.dt.gm[0] = {};
        _sendData.dt.gm[0].gid = data[0].gameId;
        _sendData.dt.gm[0].msdt = 1538637872000;
        _sendData.dt.gm[0].medt = 1538637872000;
        _sendData.dt.gm[0].st = 1;

        _sendData.dt.uiogc = {};
        _sendData.dt.uiogc.bb = 1;
        _sendData.dt.uiogc.bf = 1;
        _sendData.dt.uiogc.cbu = 0;
        _sendData.dt.uiogc.gec = 1;
        _sendData.dt.uiogc.grtp = 1;

        _sendData.err = null;

        return JSON.stringify(_sendData);
    }
    //========================================================================================

    //========================================================================================
    gameInfoGet(req, res) {
        var _params = {};
        _params.gameSession = req.body.atk;
        var _balance = null;
        if (req.session.data) {
            _balance = TDBSession.getBalanceAtData(req.session.data) / 100;
            res.send('');
        } else {
            return res.send(this.makeErrorPacket('1002', '1002 ERROR'));
        }
    }
    //========================================================================================

    //========================================================================================
    //
    spin(req, res) {
        var _params = {};
        _params.gameSession = req.body.atk;
        _params.betSize = req.body.cs;
        _params.betLevel = req.body.ml;
        _params.roundId = req.body.id;
        // _params.ingotBet = req.body.bn;

        if (!req.session.data) {
            return res.send(this.makeErrorPacket('1308', '1308 ERROR'));
        }
        if (!this.betParamCheck(TDBSession.getCsAtData(req.session.data), _params.betSize)) {
            return res.send(this.makeErrorPacket('1308', '1308-1 ERROR'));
        }
        if (!this.betParamCheck(TDBSession.getMlAtData(req.session.data), _params.betLevel)) {
            return res.send(this.makeErrorPacket('1308', '1308-2 ERROR'));
        }
        //? ============================================================================
        if (TDBSession.getOldCsAtData(req.session.data) != _params.betSize) {
            TDBSession.setLoseCountAtData(req.session.data, 0);
        }
        if (TDBSession.getOldMlAtData(req.session.data) != _params.betLevel) {
            TDBSession.setLoseCountAtData(req.session.data, 0);
        }
        TDBSession.setOldCsAtData(req.session.data, _params.betSize);
        TDBSession.setOldMlAtData(req.session.data, _params.betLevel);
        //? ============================================================================

        try {
            _params.reelDB = TDBSession.getReelDBAtData(req.session.data);
            _params.status = TDBSession.getStatusAtData(req.session.data);
            _params.gameId = TDBSession.getGameIdAtData(req.session.data);
        } catch (error) {
            return res.send(this.makeErrorPacket('2000', '2000 ERROR'));
        }
        switch (_params.status) {
            case 'GameIdle':
                this.gameSpinQuery(req, res, _params, this._reelCon, this._gameCon);
                break;
            case 'FreeGame':
                this.getFreeGame(req, res, _params, this._reelCon, this._gameCon);
                break;
            default:
                res.send(this.makeErrorPacket('2001', '2001 ERROR'));
                break;
        }
    }

    // gameSpinQuery(gameSession, /*cs*/ betSize, /*ml*/ betLevel, /*id*/roundId, reelDB, gameId, reelCon, gameCon) {
    gameSpinQuery(req, res, params, reelCon, gameCon) {
        var _result = {};
        var _sql = 'CALL GameSessionAuth(?)';
        var _para = params.gameSession;
        gameCon.query(_sql, _para, (error, results, fields) => {
            if (error || results[0].length == 0 || (req, results[0])[0].status == 'error') {
                return res.send(this.makeErrorPacket('1308', '1308 ERROR'));
            } else {
                // RTP 확인
                var _sql = 'CALL GetGameRTP(?)';
                var _para = params.gameId;
                gameCon.query(_sql, _para, (error, results, fields) => {
                    if (error || results[0].length == 0) {
                        return res.send(this.makeErrorPacket('3001', '3001 ERROR'));
                    } else {
                        var _data = results[0];
                        try {
                            _result.fixRTP = _data[0].fixRTP;
                            _result.nowRTP = _data[0].nowRTP;
                            _result.baseGameRTP = _data[0].baseGameRTP;
                            _result.freeGameRTP = _data[0].freeGameRTP;
                            _result.fakeFreeGameRTP = _data[0].fakeFreeGameRTP;
                            _result.gameRTP = _data[0].gameRTP;
                        } catch (error) {
                            return res.send(this.makeErrorPacket('3002', '3002 ERROR'));
                        }
                        if (_result.nowRTP <= _result.fixRTP || _result.nowRTP == 0) {
                            if (Math.random() > parseFloat(_result.baseGameRTP)) {

                                TDBSession.setLoseCountAtData(req.session.data, 0);

                                if (Math.random() > parseFloat(_result.freeGameRTP)) {
                                    // this.getGambleOrTakePacket(req, res, params, reelCon, gameCon, 0);
                                    this.getFreeGameIntroPacket(req, res, params, reelCon, gameCon, 0);
                                } else {
                                    // this.getGambleOrTakePacket(req, res, params, reelCon, gameCon, 0);
                                    this.getFreeGameIntroPacket(req, res, params, reelCon, gameCon, -1);
                                }
                            } else {
                                this.getGameIdlePacket(req, res, params, reelCon, gameCon);
                            }
                        } else {
                            // this.getFreeGameIntroPacket(req, res, params, reelCon, gameCon, 0);
                            if (TDBSession.getWinResultAtData(req.session.data)) {
                                var _winMoney = TDBSession.getWinMoneyAtData(req.session.data, params);
                                TDBSession.setLoseCountAtData(req.session.data, 0);
                                // console.log('gameSpinQuery _winMoney', _winMoney);
                                // this.getGambleOrTakePacket(req, res, params, reelCon, gameCon, _winMoney);
                                // this.getFreeGameIntroPacket(req, res, params, reelCon, gameCon, _winMoney);
                                if (Math.random() > parseFloat(_result.fakeFreeGameRTP)) {
                                    // this.getGambleOrTakePacket(req, res, params, reelCon, gameCon, 0);
                                    console.log('gameSpinQuery _winMoney', _winMoney);
                                    this.getFreeGameIntroPacket(req, res, params, reelCon, gameCon, _winMoney);
                                } else {
                                    // this.getGambleOrTakePacket(req, res, params, reelCon, gameCon, 0);
                                    // _winMoney = parseInt(_winMoney * (Math.random() * 10) * (Math.random() * 10));
                                    _winMoney = parseInt(_winMoney * (Math.random() * 10));
                                    console.log('gameSpinQuery rand _winMoney', _winMoney);
                                    this.getFreeGameIntroPacket(req, res, params, reelCon, gameCon, _winMoney);
                                }
                            } else {
                                this.getGameIdlePacket(req, res, params, reelCon, gameCon);
                            }
                        }
                    }
                });
            }
        });
    }

    // GameIdle 패킷 선택 및 유저 잔액정리, 유저정보, 배팅내역 정리in
    // gameSpinQuery(gameSession, /*cs*/ betSize, /*ml*/ betLevel, /*id*/roundId, reelDB, gameId, reelCon, gameCon) {
    getGameIdlePacket(req, res, params, reelCon, gameCon) {
        var _result = {}; {
            // GameIdle 패킷 확인
            var _sql = 'CALL ' + params.reelDB + '.SelectRunGameIdle()';
            var _para = '';
            reelCon.query(_sql, _para, (error, results, fields) => {
                if (error || results[0].length == 0) {
                    return res.send(this.makeErrorPacket('4000', '4000 ERROR'));
                } else {
                    var _data = results[0];
                    try {
                        _result.gameIdle = _data[0].GameIdle;
                        _result.gameIdleNo = _data[0].GameIdleNo;
                    } catch (error) {
                        return res.send(this.makeErrorPacket('4001', '4001 ERROR'));
                    } {
                        // SetUserBetGameIdleProcess
                        var _sql = 'CALL SetUserBetGameIdleProcess(?, ?, ?, ?, ?)';
                        var _para = [params.gameSession, params.gameId, _result.gameIdleNo, params.betSize, params.betLevel];
                        // var _para = [params.gameSession, params.gameId, _result.gameIdleNo, params.betSize, params.ingotBet];
                        gameCon.query(_sql, _para, (error, results, fields) => {
                            if (error || results[0].length == 0) {
                                return res.send(this.makeErrorPacket('4002', '4002 ERROR'));
                            } else {
                                var _data = results[0];
                                if (_data[0].status == 'ok') {
                                    // GameIdle 패킷 조립에 필요한 변수
                                    // _result.bn = params.ingotBet;
                                    _result.ml = params.betLevel;
                                    _result.cs = params.betSize;
                                    _result.sid = this.getRoundId(params.gameSession);
                                    _result.psid = _result.sid;
                                    _result.bl = _data[0].balance / 100;
                                    _result.tb = _data[0].wager / 100;
                                    //_result.payLines = TDBSession.getPayLineAtData(req.session.data);

                                    TDBSession.setStatusAtData(req.session.data, 'GameIdle');
                                    TDBSession.setTimeAtData(req.session.data, Date.now());

                                    req.session.save(()=>{
                                        try {
                                            res.send(this.makeGameIdlePacket(_result));
                                        } catch (error) {
                                            console.log(error);
                                            return res.send(this.makeErrorPacket('4003', '4003 ERROR'));
                                        }
                                    });
                                } else {
                                    return res.send(this.makeErrorPacket('4004', '4004 ERROR'));
                                }
                            }
                        });
                    }
                }
            });
        }
    }

    makeGameIdlePacket(data) {
        var _sendData = JSON.parse(data.gameIdle);
        var _payLines = 0.50; // (data.payLines / 100) * 3;
        var _rate = parseFloat((data.tb / _payLines).toFixed(2));
        _sendData.dt.si.ml = parseInt(data.ml);
        _sendData.dt.si.cs = parseFloat(data.cs);
        _sendData.dt.si.sid = data.sid;
        _sendData.dt.si.psid = data.psid;
        _sendData.dt.si.bl = data.bl;
        _sendData.dt.si.tb = parseFloat((_sendData.dt.si.tb * _rate).toFixed(2));
        _sendData.dt.si.tbb = parseFloat((_sendData.dt.si.tbb * _rate).toFixed(2));
        _sendData.dt.si.np = parseFloat((_sendData.dt.si.np * _rate).toFixed(2));
        // _sendData.dt.si.wk = '589755_C';
        return JSON.stringify(_sendData);
    }
    //========================================================================================

    //========================================================================================
    // GambleOrTake 패킷 선택 및 유저 잔액정리, 유저정보, 배팅내역 정리in
    // gameSpinQuery(gameSession, /*cs*/ betSize, /*ml*/ betLevel, /*id*/roundId, reelDB, gameId, reelCon, gameCon) {
    getGambleOrTakePacket(req, res, params, reelCon, gameCon, baseGameWin) {
        var _result = {}; {
            // GameIdle 패킷 확인
            var _sql = 'CALL ' + params.reelDB + '.SelectRunGambleOrTake(?)';
            var _para = baseGameWin;
            console.log('getGambleOrTakePacket baseGameWin', baseGameWin);
            reelCon.query(_sql, _para, (error, results, fields) => {
                if (error || results[0].length == 0) {
                    console.log('5000', error);
                    return res.send(this.makeErrorPacket('5000', '5000 ERROR'));
                } else {
                    var _data = results[0];
                    try {
                        _result.gambleOrTake = _data[0].GambleOrTake;
                        _result.gambleOrTakeNo = _data[0].GambleOrTakeNo;
                        _result.baseGameWin = _data[0].baseGameWin;
                    } catch (error) {
                        return res.send(this.makeErrorPacket('5001', '5001 ERROR'));
                    } {
                        // SetUserBetGameIdleProcess
                        var _sql = 'CALL SetUserBetGambleOrTakeProcess(?, ?, ?, ?, ?, ?)';
                        var _para = [params.gameSession, params.gameId, _result.gambleOrTakeNo, params.betSize, params.betLevel, _result.baseGameWin];
                        // var _para = [params.gameSession, params.gameId, _result.gambleOrTakeNo, params.betSize, params.ingotBet, _result.baseGameWin];
                        gameCon.query(_sql, _para, (error, results, fields) => {
                            if (error || results[0].length == 0) {
                                console.log('5002', error);
                                return res.send(this.makeErrorPacket('5002', '5002 ERROR'));
                            } else {
                                var _data = results[0];
                                if (_data[0].status == 'ok') {
                                    // GambleOrTake 패킷 조립에 필요한 변수
                                    // _result.bn = params.ingotBet;
                                    _result.ml = params.betLevel;
                                    _result.cs = params.betSize;
                                    _result.sid = this.getRoundId(params.gameSession);
                                    _result.psid = _result.sid;
                                    _result.bl = _data[0].balance / 100;
                                    _result.tb = _data[0].totalWager / 100;
                                    // _result.payLines = TDBSession.getPayLineAtData(req.session.data);
                                    TDBSession.setStatusAtData(req.session.data, 'GameIdle');
                                    TDBSession.setTimeAtData(req.session.data, Date.now());
                                    req.session.save(()=>{
                                        try {
                                            res.send(this.makeGambleOrTakePacket(_result));
                                        } catch (error) {
                                            console.log(error);
                                            return res.send(this.makeErrorPacket('5003', '5003 ERROR'));
                                        }
                                    });
                                } else {
                                    return res.send(this.makeErrorPacket('5004', '5004 ERROR'));
                                }
                            }
                        });
                    }
                }
            });
        }
    }

    makeGambleOrTakePacket(data) {
        var _sendData = JSON.parse(data.gambleOrTake);
        var _payLines = 0.50;// (data.payLines / 100) * 3;
        var _rate = parseFloat((data.tb / _payLines).toFixed(2));

        for (var _key in _sendData.dt.si.lw) {
            _sendData.dt.si.lw[_key] = parseFloat((_sendData.dt.si.lw[_key] * _rate).toFixed(2));
        }
        _sendData.dt.si.ml = parseInt(data.ml);
        _sendData.dt.si.cs = parseFloat(data.cs);
        _sendData.dt.si.sid = data.sid;
        _sendData.dt.si.psid = data.psid;
        _sendData.dt.si.aw = parseFloat((_sendData.dt.si.aw * _rate).toFixed(2));
        _sendData.dt.si.bl = data.bl;
        _sendData.dt.si.tb = parseFloat((_sendData.dt.si.tb * _rate).toFixed(2));
        _sendData.dt.si.tbb = parseFloat((_sendData.dt.si.tbb * _rate).toFixed(2));
        _sendData.dt.si.tw = parseFloat((_sendData.dt.si.tw * _rate).toFixed(2));
        _sendData.dt.si.np = parseFloat((_sendData.dt.si.np * _rate).toFixed(2));
        // _sendData.dt.si.wk = '589755_C';
        // console.log('_payLines', _payLines);
        // console.log('makeGambleOrTakePacket', JSON.stringify(_sendData));
        return JSON.stringify(_sendData);
    }
    //========================================================================================

    //========================================================================================
    // gameSpinQuery(gameSession, /*cs*/ betSize, /*ml*/ betLevel, /*id*/roundId, reelDB, gameId, reelCon, gameCon) {
    getFreeGameIntroPacket(req, res, params, reelCon, gameCon, totalWin) {
        var _result = {}; {
            // FreeGameIntro 패킷 확인
            var _sql = 'CALL ' + params.reelDB + '.SelectRunFreeGame(?)';
            var _para = totalWin; // 프리게임 전체 금액
            reelCon.query(_sql, _para, (error, results, fields) => {
                if (error || results[0].length == 0) {
                    return res.send(this.makeErrorPacket('6000', '6000 ERROR'));
                } else {
                    TDBSession.initFreeGameListAtData(req.session.data);
                    TDBSession.setFreeGameListAtData(req.session.data, results[0]);
                    var _data = TDBSession.getFreeGameListAtData(req.session.data);
                    _result.freeGameIntroNo = _data.FreeGameNo;
                    _result.freeGameIntro = _data.FreeGame;
                    _result.baseGameWin = _data.baseGameWin; // 프리게임 인트로는 baseGameWin 금액으로 처리
                    _result.state = _data.state;
                    if (_result.state == 'FreeGameIntro') {
                        // SetUserBetFreeGameIntroProcess
                        var _sql = 'CALL SetUserBetFreeGameIntroProcess(?, ?, ?, ?, ?, ?)';
                        var _para = [params.gameSession, params.gameId, _result.freeGameIntroNo, params.betSize, params.betLevel, _result.baseGameWin];
                        gameCon.query(_sql, _para, (error, results, fields) => {
                            if (error || results[0].length == 0) {
                                return res.send(this.makeErrorPacket('6002', '6002 ERROR'));
                            } else {
                                var _data = results[0];
                                if (_data[0].status == 'ok') {
                                    // FreeGameIntro 패킷 조립에 필요한 변수
                                    _result.ml = params.betLevel;
                                    _result.cs = params.betSize;
                                    _result.sid = this.getRoundId(params.gameSession);
                                    _result.psid = _result.sid;
                                    _result.bl = _data[0].balance / 100;
                                    _result.tb = _data[0].totalWager / 100;
                                    _result.payLines = TDBSession.getPayLineAtData(req.session.data);
                                    TDBSession.setTbAtData(req.session.data, _result.tb);
                                    TDBSession.setTimeAtData(req.session.data, Date.now());
                                    TDBSession.setStatusAtData(req.session.data, 'FreeGame');

                                    req.session.save(()=>{
                                        try {
                                            res.send(this.makeFreeGameIntroPacket(_result));
                                        } catch (error) {
                                            console.log(error);
                                            return res.send(this.makeErrorPacket('6004', '6004 ERROR'));
                                        }
                                    });
                                } else {
                                    return res.send(this.makeErrorPacket('6005', '6005 ERROR'));
                                }
                            }
                        });
                    } else {
                        return res.send(this.makeErrorPacket('6006', '6006 ERROR'));
                    }
                }
            });
        }
    }

    makeFreeGameIntroPacket(data) {
        var _sendData = JSON.parse(data.freeGameIntro);
        var _payLines = 0.50;// (data.payLines / 100) * 3;
        var _rate = parseFloat((data.tb / _payLines).toFixed(2));

        for (var _key in _sendData.dt.si.lw) {
            _sendData.dt.si.lw[_key] = parseFloat((_sendData.dt.si.lw[_key] * _rate).toFixed(2));
        }

        if (_sendData.dt.si.rs != null) {
            for (var _key in _sendData.dt.si.rs.lwm) {
                _sendData.dt.si.rs.lwm[_key] = parseFloat((_sendData.dt.si.rs.lwm[_key] * _rate).toFixed(2));
            }
            _sendData.dt.si.rs.bw = parseFloat(_sendData.dt.si.rs.bw * _rate).toFixed(2);
            _sendData.dt.si.rs.aw = parseFloat(_sendData.dt.si.rs.aw * _rate).toFixed(2);
        }

        if (_sendData.dt.si.fs != null) {
            _sendData.dt.si.fs.aw = parseFloat(_sendData.dt.si.fs.aw * _rate).toFixed(2);
        }

        _sendData.dt.si.ml = data.ml;
        _sendData.dt.si.cs = data.cs;
        _sendData.dt.si.sid = data.sid;
        _sendData.dt.si.psid = data.psid;
        _sendData.dt.si.aw = parseFloat((_sendData.dt.si.aw * _rate).toFixed(2));
        _sendData.dt.si.bl = data.bl;
        _sendData.dt.si.tb = parseFloat((_sendData.dt.si.tb * _rate).toFixed(2));
        _sendData.dt.si.tbb = parseFloat((_sendData.dt.si.tbb * _rate).toFixed(2));
        _sendData.dt.si.tw = parseFloat((_sendData.dt.si.tw * _rate).toFixed(2));
        _sendData.dt.si.np = parseFloat((_sendData.dt.si.np * _rate).toFixed(2));
        return JSON.stringify(_sendData);
    }
    //========================================================================================

    // getFreeGame(gameToken, /*cs*/ betSize, /*ml*/ betLevel, /*id*/roundId, gameId) {
    getFreeGame(req, res, params, reelCon, gameCon) {
        var _result = {};
        var _sql = 'CALL GameSessionAuth(?)';
        var _para = params.gameSession;
        gameCon.query(_sql, _para, (error, results, fields) => {
            if (error || results[0].length == 0 || (req, results[0])[0].status == 'error') {
                return res.send(this.makeErrorPacket('7000', '7000 ERROR'));
            } else {
                var _data = TDBSession.getFreeGameListAtData(req.session.data);
                _result.freeGameNo = _data.FreeGameNo;
                _result.freeGame = _data.FreeGame;
                _result.state = _data.state;

                _result.freeGameWin = _data.freeGameWin;
                _result.bonusGameWin = _data.bonusGameWin;

                _result.totalWin = _data.totalWin; // <== 사용하지 않으면 향후 삭제
                // console.log('sessionListFreeGamePacketListPop:', _result);
                if (!_result.freeGame || (_result.state != 'FreeGame' && _result.state != 'FreeGameOutro')) {
                    return res.send(this.makeErrorPacket('7001', '7001 ERROR'));
                } else {
                    // SetUserBetFreeGameProcess
                    var _sql = 'CALL SetUserBetFreeGameProcess(?, ?, ?, ?, ?, ?, ?, ?)';
                    var _para = [params.gameSession, params.gameId, _result.freeGameNo, params.betSize, params.betLevel, _result.freeGameWin, _result.bonusGameWin, _result.state];
                    gameCon.query(_sql, _para, (error, results, fields) => {
                        if (error || results[0].length == 0) {
                            console.log(error);
                            return res.send(this.makeErrorPacket('7002', '7002 ERROR'));
                        } else {
                            var _data = results[0];
                            if (_data[0].status == 'ok') {
                                _result.bl = _data[0].balance / 100;
                                _result.cs = params.betSize;
                                _result.ml = params.betLevel;
                                _result.sid = this.getRoundId(params.gameSession);
                                _result.psid = _result.sid;
                                _result.payLines = TDBSession.getPayLineAtData(req.session.data);
                                _result.tb = TDBSession.getTbAtData(req.session.data);

                                TDBSession.setTimeAtData(req.session.data, Date.now());
                                if (_result.state == 'FreeGameOutro') {
                                    TDBSession.setStatusAtData(req.session.data, 'GameIdle');
                                }
                                req.session.save(()=>{
                                    try {
                                        res.send(this.makeFreeGamePacket(_result));
                                    } catch (error) {
                                        console.log(error);
                                        return res.send(this.makeErrorPacket('7003', '7003 ERROR'));
                                    }
                                });
                            } else {
                                return res.send(this.makeErrorPacket('7004', '7004 ERROR'));
                            }
                        }
                    });
                }
            }
        });
    }

    makeFreeGamePacket(data) {
        var _sendData = JSON.parse(data.freeGame);
        var _payLines = 0.50;// (data.payLines / 100) * 3;
        var _rate = parseFloat((data.tb / _payLines).toFixed(2));

        for (var _key in _sendData.dt.si.lw) {
            _sendData.dt.si.lw[_key] = parseFloat((_sendData.dt.si.lw[_key] * _rate).toFixed(2));
        }

        if (_sendData.dt.si.rs != null) {
            for (var _key in _sendData.dt.si.rs.lwm) {
                _sendData.dt.si.rs.lwm[_key] = parseFloat((_sendData.dt.si.rs.lwm[_key] * _rate).toFixed(2));
            }
            _sendData.dt.si.rs.bw = parseFloat(_sendData.dt.si.rs.bw * _rate).toFixed(2);
            _sendData.dt.si.rs.aw = parseFloat(_sendData.dt.si.rs.aw * _rate).toFixed(2);
        }

        if (_sendData.dt.si.fs != null) {
            _sendData.dt.si.fs.aw = parseFloat(_sendData.dt.si.fs.aw * _rate).toFixed(2);
        }

        _sendData.dt.si.ml = data.ml;
        _sendData.dt.si.cs = data.cs;
        _sendData.dt.si.sid = data.sid;
        _sendData.dt.si.psid = data.psid;
        _sendData.dt.si.aw = parseFloat((_sendData.dt.si.aw * _rate).toFixed(2));
        _sendData.dt.si.bl = data.bl;
        _sendData.dt.si.tb = parseFloat((_sendData.dt.si.tb * _rate).toFixed(2));
        _sendData.dt.si.tbb = parseFloat((_sendData.dt.si.tbb * _rate).toFixed(2));
        _sendData.dt.si.tw = parseFloat((_sendData.dt.si.tw * _rate).toFixed(2));
        _sendData.dt.si.np = parseFloat((_sendData.dt.si.np * _rate).toFixed(2));
        return JSON.stringify(_sendData);
    }
    //========================================================================================

    //========================================================================================
    selectcharacter(req, res) {
        var _params = {};
        _params.gameSession = req.body.atk;
        _params.betSize = req.body.cs;
        _params.betLevel = req.body.ml;
        _params.roundId = req.body.id;
        _params.s = req.body.s;
        try {
            _params.reelDB = TDBSession.getReelDBAtData(req.session.data);
            _params.status = TDBSession.getStatusAtData(req.session.data);
            _params.gameId = TDBSession.getGameIdAtData(req.session.data);
        } catch (error) {
            return res.send(this.makeErrorPacket('8000', '8000 ERROR'));
        }
        switch (_params.status) {
            case 'SelectCharacter':
                this.selectCharacterQuery(req, res, _params, this._reelCon, this._gameCon);
                break;
            default:
                res.send(this.makeErrorPacket('8001', '8001 ERROR'));
                break;
        }
    }
    selectCharacterQuery(req, res, params, reelCon, gameCon) {
        var _result = {};
        var _sql = 'CALL GameSessionAuth(?)';
        var _para = params.gameSession;
        gameCon.query(_sql, _para, (error, results, fields) => {
            if (error || results[0].length == 0 || (req, results[0])[0].status == 'error') {
                return res.send(this.makeErrorPacket('9000', '9000 ERROR'));
            } else {
                var data = results[0];
                _result.bl = data[0].balance / 100;
                var _sql = 'CALL ' + params.reelDB + '.SelectFreeGameCharacter(?, ?)';
                var _para = [params.s, 0];
                reelCon.query(_sql, _para, (error, results, fields) => {
                    if (error || results[0].length == 0) {
                        console.log(error);
                        return res.send(this.makeErrorPacket('9001', '9001 ERROR'));
                    } else {
                        TDBSession.initFreeGameListAtData(req.session.data);
                        TDBSession.setFreeGameListAtData(req.session.data, results[0]);

                        //============================================================================
                        // TotalWinMoeny 재설정을 위한 파라메터 처리
                        var _data = TDBSession.getFreeGameListAtData(req.session.data);
                        try {
                            var _json = JSON.parse(_data.FreeGame);
                        } catch (error) {
                            console.log(error);
                            return res.send(this.makeErrorPacket('9002', '9002 ERROR'));
                        }
                        TDBSession.setNewBaseGameWinAtData(req.session.data, _json.dt.si.tw);
                        //============================================================================

                        // selectCharacter 처리용 Packet 재확인
                        _data = TDBSession.getFreeGameListAtData(req.session.data);
                        _result.freeGame = _data.FreeGame;
                        _result.state = _data.state;
                        if (_result.state == 'SelectCharacter') {
                            _result.nowBaseGameWin = TDBSession.getNowBaseGameWinAtData(req.session.data);
                            _result.cs = params.betSize;
                            _result.ml = params.betLevel;
                            _result.bwm = TDBSession.getBwmAtData(req.session.data);
                            _result.sid = this.getRoundId(params.gameSession);
                            _result.psid = _result.sid;
                            _result.tb = TDBSession.getTbAtData(req.session.data);
                            TDBSession.setTimeAtData(req.session.data, Date.now());
                            TDBSession.setStatusAtData(req.session.data, 'FreeGame');
                            req.session.save(()=>{
                                try {
                                    res.send(this.makeSelectCharacterPacket(_result));
                                } catch (error) {
                                    console.log(error);
                                    return res.send(this.makeErrorPacket('9003', '9003 ERROR'));
                                }
                            });
                        } else {
                            return res.send(this.makeErrorPacket('9004', '9004 ERROR'));
                        }
                    }
                });
            }
        });
    }

    makeSelectCharacterPacket(data) {
        var _sendData = JSON.parse(data.freeGame);
        var _payLines = 0.30; //data.payLines / 100;
        var _rate = parseFloat((data.tb / _payLines).toFixed(2));

        _sendData.dt.si.aw = data.nowBaseGameWin;
        _sendData.dt.si.bl = data.bl;
        _sendData.dt.si.cs = data.cs;
        _sendData.dt.si.ml = data.ml;
        _sendData.dt.si.bns.bwm = data.bwm;
        _sendData.dt.si.sid = data.sid;
        _sendData.dt.si.psid = data.psid;
        _sendData.dt.si.tbb = parseFloat((_sendData.dt.si.tbb * _rate).toFixed(2));

        return JSON.stringify(_sendData);
    }
    //========================================================================================

    getDeviceBenchmark(req, res) {
        res.send('{"dt":null,"err":null}');
    }

    gameNameGet(req, res) {
        var _sendData = '';
        res.send(_sendData);
    }

    getByResourcesTypeIds(req, res) {
        var _send = '';
        res.send(_send);
    }

    gameRuleGet(req, res) {
        var _params = {};
        _params.gameSession = req.body.atk;
        try {
            _params.reelDB = TDBSession.getReelDBAtData(req.session.data);
            _params.gameId = TDBSession.getGameIdAtData(req.session.data);
            this.gameRuleQuery(req, res, _params, this._reelCon, this._gameCon);
        } catch (error) {
            return res.send(this.makeErrorPacket('2000', '2000 ERROR'));
        }
    }

    gameRuleQuery(req, res, params, reelCon, gameCon) {
        var _result = {};
        var _sql = 'CALL GameSessionAuth(?)';
        var _para = params.gameSession;
        gameCon.query(_sql, _para, (error, results, fields) => {
            if (error || results[0].length == 0 || (req, results[0])[0].status == 'error') {
                return res.send(this.makeErrorPacket('1308', '1308 ERROR'));
            } else {
                // RTP 확인
                var _sql = 'CALL GetGameRTP(?)';
                var _para = params.gameId;
                gameCon.query(_sql, _para, (error, results, fields) => {
                    if (error || results[0].length == 0) {
                        return res.send(this.makeErrorPacket('3001', '3001 ERROR'));
                    } else {
                        var _data = results[0];
                        try {
                            _result.fixRTP = _data[0].fixRTP;
                            _result.nowRTP = _data[0].nowRTP;
                            _result.baseGameRTP = _data[0].baseGameRTP;
                            _result.freeGameRTP = _data[0].freeGameRTP;
                            _result.gameRTP = _data[0].gameRTP;
                            res.send(this.makeGameRulePacket(_result));
                        } catch (error) {
                            return res.send(this.makeErrorPacket('3002', '3002 ERROR'));
                        }
                    }
                });
            }
        });
    }

    makeGameRulePacket(data) {
        var _sendData = '';
        return _sendData;
    }
}

module.exports = TGameServer;