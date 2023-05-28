import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
const fireStore = admin.firestore();

export default functions.region('asia-northeast1').firestore.document('toSign/{toSign}').onCreate((data, context) => {
    const toSignRef = fireStore.collection('toSign').doc(data.id);
    toSignRef.update({
      phase: 'processing'
    }).then().catch();
    const uid = data.get('uid');
    const type = data.get('type');
    const page = data.get('page');
    const numbers = data.get('numbers');
    const group = data.get('group');
    const feedback = data.get('feedback');
    const family = data.get('family');
    const time = data.get('time');
    const uid_leader = data.get('uid_leader');
    const signType = data.get('signType');
    const signID = data.get('signID');
    const activity = data.get('activity');
    const activityID = data.get('activityID');
    const documentId = toSignRef.id;
    const searchUidRef = fireStore.collection(type).where('uid', '==', uid).where('page', '==', page);
    searchUidRef.get()
      .then(doc => {
        if(doc.docs.length !== 0){
          let count = 0;
          const snapshot = doc.docs[0];
          if(snapshot.get('end') === undefined){
            let dataSigned = snapshot.get('signed');
            for(let i of numbers){
              const signInfo = {
                family: family,
                feedback: feedback,
                phase: 'signed',
                phaze: 'signed',
                time: time,
                uid: uid_leader,
                signType: signType,
                signID: signID,
                activity: activity,
                activityID: activityID
              }
              dataSigned[i.toString()]= signInfo;
            }
            for(let i of numbers){
              const dataSigned_get = dataSigned[i.toString()];
              if(dataSigned_get === undefined){
                const signInfo2 = {
                  family: family,
                  feedback: feedback,
                  phase: 'signed',
                  phaze: 'signed',
                  time: time,
                  uid: uid_leader,
                  signType: signType,
                  signID: signID,
                  activity: activity,
                  activityID: activityID
                }
                dataSigned[i.toString()] = signInfo2;
              } else if(dataSigned_get['phaze'] === 'reject' || dataSigned_get['phaze'] === 'withdraw'){
                const signInfo2 = {
                  family: family,
                  feedback: feedback,
                  phase: 'signed',
                  phaze: 'signed',
                  time: time,
                  uid: uid_leader,
                  signType: signType,
                  signID: signID,
                  activity: activity,
                  activityID: activityID
                }
                dataSigned[i.toString()] = signInfo2;}
            }
            for(let j of Object.keys(dataSigned)){
              const partData = dataSigned[j.toString()];
              if(partData['phaze'] === 'signed'){
                count++;
              }
            }
            
            const setItemRef = fireStore.collection(type).doc(snapshot.id);
            setItemRef.update({signed: dataSigned,isCitationed: false})
              .then((__) => {
                const searchUserRef = fireStore.collection('user').where('uid', '==', uid);
                searchUserRef.get()
                  .then(userDoc => {
                    const userSnapshot = userDoc.docs[0];
                    let signCount : {[index: string]:any} = {};
                    signCount[page.toString()] = count;
                    let isEnd:Boolean = false;
                    const challenge_hasItem : Array<number> = [
                        4,6,4,4,4,3,5,3,4,2,4,6,3,4,3,4,3,3,4,5,5,4,3,6,1,4,5,4,6,3,2,4,4,4,4,4,5,5,6,4,
                    ];
                    const kuma_hasItem : Array<number> = [
                        2,1,2,2,1,1,1,1,1,4,1,1,1,1
                    ];
                    const tukinowa_hasItem : Array<number> = [
                        6,1,3,1,1,1
                    ];
                    if(type !== 'challenge' && type !== 'kuma' && page !== 0){
                      isEnd = true;
                    } else if(type !== 'challenge' && type !== 'kuma' && page === 0 && count === 2){
                      isEnd = true;
                    } else if(type === 'challenge' && type !== 'kuma' && challenge_hasItem[page] === count) {
                      isEnd = true;
                    } else if(type !== 'challenge' && type === 'kuma' && kuma_hasItem[page] === count) {
                      isEnd = true;
                    } else if(type !== 'tukinowa' && tukinowa_hasItem[page] === count) {
                      isEnd = true;
                    }
                    if(isEnd){
                      const updateDocumentData = fireStore.collection(type).doc(setItemRef.id);
                      updateDocumentData.update({end: time, isCitationed: false}).then().catch();
                      const challenge_number : Array<string> = [
                          '1-1','1-2','1-3','1-4','1-5','1-6','1-7','1-8','2-1','2-2','2-3','2-4','2-5','2-6','2-7','3-1','3-2','3-3','3-4','3-5','3-6','3-7','3-8','3-9','3-10','4-1','4-2','4-3','4-4','4-5','5-1','5-2','5-3','5-4','5-5','5-6','5-7','5-8','5-9','5-10'
                      ];
                      const usagi_title : Array<string> = [
                          '笑顔','運動','安全','清潔','計測','なわ結び','工作','表現','観察','野外活動','役に立つ','日本の国旗','世界の国々'
                      ];
                      const sika_title : Array<string> = [
                          '感謝','運動','事故の予防','健康','計測','なわ結び','工作','表現','観察','野外活動','暮らしのマナー','役に立つ','日本の国旗','世界の国々'
                      ];
                      const kuma_title : Array<string> = [
                          '心がけ','成長','事故への対応','救急','計測','なわ結び','工作','表現','観察','野外活動','暮らしのマナー','役に立つ','日本の国旗','世界の国々'
                      ];
                      const tukinowa_title : Array<string> = [
                          '基本', '健康と発達', 'スカウト技能', '善行', '信仰奨励', '班長会議',
                      ];
                      const challenge_title : Array<string> = [
                          '国際','市民','友情','動物愛護','案内','自然保護','手伝い','災害救助員','天文学者','自然観察館','ハイカー','キャンパー','地質学者','気象学者','探検家','写真博士','コンピュータ博士','自転車博士','工作博士','通信博士','修理博士','乗り物博士','技術博士','救急博士','特技博士','水泳博士','運動選手','チームスポーツ博士','スキー選手','アイススケート選手','収集家','画家','音楽家','料理家','フィッシャーマン','旅行家','園芸家','演劇家','読書家','マジシャン'
                      ];
                      let bookName!:string;
                      let itemName!:string;
                      if(type === 'usagi'){
                        bookName = 'うさぎのカブブック';
                        itemName = usagi_title[page];
                      } else if(type === 'sika'){
                        bookName = 'しかのカブブック';
                        itemName = sika_title[page];
                      } else if(type === 'kuma'){
                        bookName = 'くまのカブブック';
                        itemName = kuma_title[page];
                      } else if(type === 'tukinowa'){
                        bookName = '月の輪';
                        itemName = tukinowa_title[page];
                      } else if(type === 'challenge'){
                        bookName = 'チャレンジ章';
                        itemName = challenge_title[page];
                      }
                      let effortBody:string;
                      if(type === 'challenge'){
                        effortBody = bookName + ' ' + challenge_number[page] + ' ' + itemName + 'を完修！';
                      } else {
                        effortBody = bookName + ' ' + (page+1).toString() + ' ' + itemName + 'を完修！';
                      }
  
                      let enable_community = false;
                      if(group === ' j27DETWHGYEfpyp2Y292'){
                        enable_community = true;
                      }
  
                      const effortData = {
                        body: effortBody,
                        call: userSnapshot.get('call'),
                        congrats: 0,
                        family: userSnapshot.get('family'),
                        first: userSnapshot.get('first'),
                        group: group,
                        time: time,
                        type: type,
                        uid: uid,
                        taskID: snapshot.id,
                        enable_community: enable_community,
                        'page': page
                      };
                      fireStore.collection('effort').add(effortData).then().catch();
                      fireStore.collection('toSign').doc(documentId).update({'phase': 'processed'}).then().catch();
                    } else {
                      fireStore.collection('toSign').doc(documentId).update({'phase': 'processed'}).then().catch();
                    }
                  const challengeRef = fireStore.collection(type).where('uid', '==', uid);
                  challengeRef.get()
                  .then(doc_challenge => {
                    const documents_challenge = doc_challenge.docs;
                    let signCount_challenge : {[index: string]:any} = {};
                    for(let j=0; j<documents_challenge.length; j++){
                      let count_part:number = 0;
                      const snapshot_challenge = documents_challenge[j];
                      const page_challenge = snapshot_challenge.get('page');
                      const signed = snapshot_challenge.get('signed');
                      if(signed !== undefined){
                        for(const key of Object.keys(signed)){
                          const element = signed[key];
                          if(element['phaze'] === 'signed'){
                            count_part++;
                          }
                        };
                      }
                      if(count_part !== 0 && page_challenge !== undefined){
                        signCount_challenge[page_challenge.toString()] = count_part;
                      }
                    }
                    const setUserRef = fireStore.collection('user').doc(userSnapshot.id);
                    setUserRef.update({
                      [type]: signCount_challenge
                    }).then().catch();
                  }).catch()
                  }).then().catch();
              }).then().catch();
          } else {
            fireStore.collection('toSign').doc(documentId).update({'phase': 'processed'}).then().catch();
          }
        } else{
          let dataSigned: {[index: string]:any} = {};
          
          for(let i of numbers){
            const signInfo = {
              family: family,
              feedback: feedback,
              phase: 'signed',
              phaze: 'signed',
              time: time,
              uid: uid_leader,
              signType: signType,
              signID: signID,
              activity: activity,
              activityID: activityID
            }
            dataSigned[i.toString()]= signInfo;
          }
          const basicInfo = {
            group: group,
            page: page,
            start: time,
            uid: uid,
            signed: dataSigned,
            isCitationed: false
          }
          const setItemRef = fireStore.collection(type).doc();
          setItemRef.set(basicInfo)
            .then((__) => {
              const searchUserRef = fireStore.collection('user').where('uid', '==', uid);
              searchUserRef.get()
                .then(userDoc => {
                  const userSnapshot = userDoc.docs[0];
                  let signCount : {[index: string]:any} = {};
                  let count:number;
                  if(userSnapshot.get(type)!==undefined){
                    signCount = userSnapshot.get(type);
                    if(signCount[page.toString()] !== null){
                      count = Object.keys(dataSigned).length;
                    } else {
                      count = Object.keys(dataSigned).length;
                    }
                  } else {
                    count = Object.keys(dataSigned).length;
                  }
                  signCount[page.toString()] = count;
                  let isEnd:Boolean = false;
                  const challenge_hasItem : Array<number> = [
                      4,6,4,4,4,3,5,3,4,2,4,6,3,4,3,4,3,3,4,5,5,4,3,6,1,4,5,4,6,3,2,4,4,4,4,4,5,5,6,4,
                  ];
                  const kuma_hasItem : Array<number> = [
                      2,1,2,2,1,1,1,1,1,4,1,1,1,1
                  ];
                  const tukinowa_hasItem : Array<number> = [
                      6,1,3,1,1,1
                  ];
                  if(type !== 'challenge' && type !== 'kuma' && page !== 0){
                    isEnd = true;
                  } else if(type !== 'challenge' && type !== 'kuma' && page === 0 && count === 2){
                    isEnd = true;
                  } else if(type === 'challenge' && type !== 'kuma' && challenge_hasItem[page] === count) {
                    isEnd = true;
                  } else if(type !== 'challenge' && type === 'kuma' && kuma_hasItem[page] === count) {
                    isEnd = true;
                  } else if(type !== 'tukinowa' && tukinowa_hasItem[page] === count) {
                    isEnd = true;
                  }
                  if(isEnd){
                    const updateDocumentData = fireStore.collection(type).doc(setItemRef.id);
                    updateDocumentData.update({end: time, isCitationed: false}).then().catch();
                    const challenge_number : Array<string> = [
                        '1-1','1-2','1-3','1-4','1-5','1-6','1-7','1-8','2-1','2-2','2-3','2-4','2-5','2-6','2-7','3-1','3-2','3-3','3-4','3-5','3-6','3-7','3-8','3-9','3-10','4-1','4-2','4-3','4-4','4-5','5-1','5-2','5-3','5-4','5-5','5-6','5-7','5-8','5-9','5-10'
                    ];
                    const usagi_title : Array<string> = [
                        '笑顔','運動','安全','清潔','計測','なわ結び','工作','表現','観察','野外活動','役に立つ','日本の国旗','世界の国々'
                    ];
                    const sika_title : Array<string> = [
                        '感謝','運動','事故の予防','健康','計測','なわ結び','工作','表現','観察','野外活動','暮らしのマナー','役に立つ','日本の国旗','世界の国々'
                    ];
                    const kuma_title : Array<string> = [
                        '心がけ','成長','事故への対応','救急','計測','なわ結び','工作','表現','観察','野外活動','暮らしのマナー','役に立つ','日本の国旗','世界の国々'
                    ];
                    const tukinowa_title : Array<string> = [
                        '基本', '健康と発達', 'スカウト技能', '善行', '信仰奨励', '班長会議',
                    ];
                    const challenge_title : Array<string> = [
                        '国際','市民','友情','動物愛護','案内','自然保護','手伝い','災害救助員','天文学者','自然観察館','ハイカー','キャンパー','地質学者','気象学者','探検家','写真博士','コンピュータ博士','自転車博士','工作博士','通信博士','修理博士','乗り物博士','技術博士','救急博士','特技博士','水泳博士','運動選手','チームスポーツ博士','スキー選手','アイススケート選手','収集家','画家','音楽家','料理家','フィッシャーマン','旅行家','園芸家','演劇家','読書家','マジシャン'
                    ];
                    let bookName!:string;
                    let itemName!:string;
                    if(type === 'usagi'){
                      bookName = 'うさぎのカブブック';
                      itemName = usagi_title[page];
                    } else if(type === 'sika'){
                      bookName = 'しかのカブブック';
                      itemName = sika_title[page];
                    } else if(type === 'kuma'){
                      bookName = 'くまのカブブック';
                      itemName = kuma_title[page];
                    } else if(type === 'tukinowa'){
                      bookName = '月の輪';
                      itemName = tukinowa_title[page];
                    } else if(type === 'challenge'){
                      bookName = 'チャレンジ章';
                      itemName = challenge_title[page];
                    }
                    let effortBody:string;
                    if(type === 'challenge'){
                      effortBody = bookName + ' ' + challenge_number[page] + ' ' + itemName + 'を完修！';
                    } else {
                      effortBody = bookName + ' ' + (page+1).toString() + ' ' + itemName + 'を完修！';
                    }
  
                    const effortData = {
                      body: effortBody,
                      call: userSnapshot.get('call'),
                      congrats: 0,
                      family: userSnapshot.get('family'),
                      first: userSnapshot.get('first'),
                      group: group,
                      time: time,
                      type: type,
                      uid: uid,
                      'page': page
                    };
                    fireStore.collection('effort').add(effortData).then().catch();
                    fireStore.collection('toSign').doc(documentId).update({'phase': 'processed'}).then().catch();
                    } else {
                    fireStore.collection('toSign').doc(documentId).update({'phase': 'processed'}).then().catch();
                    }
  
                    const challengeRef = fireStore.collection(type).where('uid', '==', uid);
                    challengeRef.get()
                    .then(doc_challenge => {
                      const documents_challenge = doc_challenge.docs;
                      let signCount_challenge : {[index: string]:any} = {};
                      for(let j=0; j<documents_challenge.length; j++){
                        let count_part:number = 0;
                        const snapshot_challenge = documents_challenge[j];
                        const page_challenge = snapshot_challenge.get('page');
                        const signed = snapshot_challenge.get('signed');
                        if(signed !== undefined){
                          for(const key of Object.keys(signed)){
                            const element = signed[key];
                            if(element['phaze'] === 'signed'){
                              count_part++;
                            }
                          };
                        }
                        if(count_part !== 0 && page_challenge !== undefined){
                          signCount_challenge[page_challenge.toString()] = count_part;
                        }
                      }
                      const setUserRef = fireStore.collection('user').doc(userSnapshot.id);
                      setUserRef.update({
                        [type]: signCount_challenge
                      }).then().catch();
                    }).catch()
                }).then().catch();
            }).then().catch();
        }
      }).then().catch();
    return 0;
  });