// 예시 연구 공고. 마감일은 오늘 기준 며칠 뒤로 계산해서 체험판이 늘 살아 있게 해요.
window.REGIONS = ['서울', '경기', '인천', '대전', '대구', '부산', '광주', '강원', '충청', '전라', '경상', '제주'];
window.TYPES = ['설문', '인터뷰', '행동 실험', '뇌영상', '사용성 테스트', '장기 추적'];

window.SAMPLE_STUDIES = [
  {
    id: 's1', title: '수면 습관과 작업기억에 관한 실험 연구',
    school: '연세대학교', lab: '심리학과 인지신경과학 연구실',
    type: '행동 실험', mode: '대면', region: '서울', location: '위당관 312호',
    minutes: 60, pay: 20000, capacity: 40, applied: 27, daysLeft: 3,
    ageMin: 19, ageMax: 35, gender: '무관',
    conditions: ['오른손잡이', '교정시력 0.8 이상', '최근 1개월 수면제 복용 경험 없음'],
    irb: '7001988-202609-HR-311-02', contact: 'sleeplab@yonsei.ac.kr',
    summary: '컴퓨터 화면에 나오는 숫자와 도형을 기억하는 과제를 해요. 시작 전에 최근 일주일 수면 습관 설문을 작성해요.'
  },
  {
    id: 's2', title: '20대 1인 가구의 배달앱 이용 경험 인터뷰',
    school: '서울대학교', lab: '소비자학과 디지털소비 연구실',
    type: '인터뷰', mode: '온라인', region: '', location: 'Zoom',
    minutes: 50, pay: 30000, capacity: 12, applied: 5, daysLeft: 9,
    ageMin: 20, ageMax: 29, gender: '무관',
    conditions: ['혼자 사는 사람', '최근 한 달 배달앱 주 2회 이상 이용'],
    irb: 'SNUIRB-2609/002-004', contact: 'dclab@snu.ac.kr',
    summary: '배달앱을 고르는 기준, 리뷰를 읽는 방식, 지출 관리에 대해 편하게 이야기 나눠요. 녹음은 연구 목적에만 써요.'
  },
  {
    id: 's3', title: '스마트폰 사용 시간과 정서 상태 온라인 설문',
    school: '고려대학교', lab: '교육학과 청소년발달 연구실',
    type: '설문', mode: '온라인', region: '', location: '온라인 설문 링크',
    minutes: 15, pay: 3000, capacity: 300, applied: 214, daysLeft: 14,
    ageMin: 18, ageMax: 24, gender: '무관',
    conditions: ['대학 재학생'],
    irb: 'KUIRB-2026-0412-01', contact: 'youthdev@korea.ac.kr',
    summary: '하루 스마트폰 사용 시간과 최근 2주 동안의 기분을 묻는 설문이에요. 사례비는 모바일 상품권으로 드려요.'
  },
  {
    id: 's4', title: '음악 감상 중 뇌 활동 fMRI 측정',
    school: 'KAIST', lab: '바이오및뇌공학과 청각신경 연구실',
    type: '뇌영상', mode: '대면', region: '대전', location: 'KAIST 뇌영상센터',
    minutes: 120, pay: 80000, capacity: 20, applied: 18, daysLeft: 2,
    ageMin: 20, ageMax: 40, gender: '무관',
    conditions: ['몸에 금속 보형물·인공 심박동기 없음', '폐소공포증 없음', '오른손잡이'],
    irb: 'KH2026-118', contact: 'auditory@kaist.ac.kr',
    summary: 'MRI 기계 안에 누워 짧은 음악을 듣고 버튼으로 느낌을 평가해요. 측정 전에 안전 설명을 충분히 드려요.'
  },
  {
    id: 's5', title: '고령자용 키오스크 화면 사용성 테스트',
    school: '부산대학교', lab: '산업공학과 HCI 연구실',
    type: '사용성 테스트', mode: '대면', region: '부산', location: '부산대 제6공학관 205호',
    minutes: 40, pay: 25000, capacity: 15, applied: 4, daysLeft: 20,
    ageMin: 60, ageMax: 85, gender: '무관',
    conditions: ['키오스크로 주문해 본 경험 상관없음'],
    irb: 'PNU IRB/2026_77_HR', contact: 'hci@pusan.ac.kr',
    summary: '새로 만든 키오스크 화면으로 음식을 주문해 보고 어려웠던 점을 알려 주세요. 보호자 동반도 괜찮아요.'
  },
  {
    id: 's6', title: '임신 중 수면과 스트레스 8주 추적 연구',
    school: '이화여자대학교', lab: '간호학과 모성건강 연구실',
    type: '장기 추적', mode: '온라인', region: '', location: '앱 일지 + 월 1회 영상통화',
    minutes: 480, pay: 150000, capacity: 50, applied: 31, daysLeft: 25,
    ageMin: 20, ageMax: 45, gender: '여성',
    conditions: ['임신 12~24주', '스마트워치 착용 가능'],
    irb: 'EWHA-202608-0021-03', contact: 'maternal@ewha.ac.kr',
    summary: '8주 동안 하루 5분 앱에 수면·기분 일지를 쓰고, 스마트워치로 수면을 기록해요. 시간은 8주 전체를 합친 값이에요.'
  },
  {
    id: 's7', title: '외국어 발음 학습 앱 효과 실험',
    school: '경북대학교', lab: '영어교육과 제2언어습득 연구실',
    type: '행동 실험', mode: '대면', region: '대구', location: '경북대 사범대학 1호관',
    minutes: 90, pay: 30000, capacity: 36, applied: 12, daysLeft: 11,
    ageMin: 19, ageMax: 30, gender: '무관',
    conditions: ['영어권 거주 경험 6개월 미만'],
    irb: 'KNU-2026-0193', contact: 'sla@knu.ac.kr',
    summary: '발음 연습 앱을 30분 쓰기 전과 후에 영어 문장을 녹음해요. 녹음 파일은 익명으로 분석해요.'
  },
  {
    id: 's8', title: '직장인 재택근무와 일-삶 균형 설문',
    school: '성균관대학교', lab: '경영학과 조직행동 연구실',
    type: '설문', mode: '온라인', region: '', location: '온라인 설문 링크',
    minutes: 20, pay: 5000, capacity: 400, applied: 389, daysLeft: 1,
    ageMin: 25, ageMax: 59, gender: '무관',
    conditions: ['현재 주 1회 이상 재택근무 중인 직장인'],
    irb: 'SKKU 2026-09-017', contact: 'ob@skku.edu',
    summary: '재택근무 빈도, 업무 경계 관리, 소진 정도를 묻는 설문이에요.'
  },
  {
    id: 's9', title: '남성 갱년기 증상 인식 심층 인터뷰',
    school: '전남대학교', lab: '보건학과 남성건강 연구실',
    type: '인터뷰', mode: '대면', region: '광주', location: '전남대 의과대학 3층 세미나실',
    minutes: 70, pay: 40000, capacity: 10, applied: 3, daysLeft: 17,
    ageMin: 45, ageMax: 65, gender: '남성',
    conditions: [],
    irb: 'CNUH-2026-201', contact: 'menshealth@jnu.ac.kr',
    summary: '중년 남성이 몸과 마음의 변화를 어떻게 느끼고 대처하는지 이야기를 들어요. 원하면 온라인으로 바꿀 수 있어요.'
  }
];
