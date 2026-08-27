import { useEffect, useMemo, useRef, useState } from "react";
import {
  BackpackIcon,
  ChatBubbleIcon,
  CheckCircledIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleIcon,
  ClockIcon,
  DotsHorizontalIcon,
  GlobeIcon,
  HomeIcon,
  IdCardIcon,
  LightningBoltIcon,
  LockClosedIcon,
  MinusIcon,
  PersonIcon,
  PlusIcon,
  PlayIcon,
  RocketIcon,
  Share1Icon,
  SewingPinIcon,
  StarIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { BottomSheet, Carousel, MobileScroll } from "./mobile";

type TabId = "home" | "shop" | "live" | "me";

const tabs = [
  { id: "home" as const, label: "首页", icon: HomeIcon },
  { id: "shop" as const, label: "选茶", icon: BackpackIcon },
  { id: "live" as const, label: "茶会", icon: ChatBubbleIcon },
  { id: "me" as const, label: "我的", icon: PersonIcon },
];

const quickActions = [
  { label: "新人茶礼", note: "满 199 减 30", icon: IdCardIcon },
  { label: "三人成团", note: "古树白茶 7 折", icon: ChatBubbleIcon },
  { label: "今日秒杀", note: "20:00 开始", icon: LightningBoltIcon },
  { label: "茶分兑礼", note: "860 茶分可用", icon: StarIcon },
];

type TeaProduct = {
  name: string;
  note: string;
  size: string;
  price: number;
  image: string;
  subcategory: string;
  tag?: string;
};

type TeaGroup = {
  name: string;
  note: string;
  subcategories: string[];
  products: TeaProduct[];
};

type CartLine = {
  product: TeaProduct;
  quantity: number;
};

const teaCatalog: TeaGroup[] = [
  {
    name: "白茶",
    note: "清甜柔润 · 久藏生香",
    subcategories: ["全部", "老树白茶", "有机白茶"],
    products: [
      { name: "2017 老树森林古树白茶", note: "陈香温润，山野甜感", size: "357g / 饼", price: 680, image: "/assets/products/white-wrapped.png", subcategory: "老树白茶", tag: "珍藏" },
      { name: "大雪山古树白茶龙珠", note: "一粒一泡，清甜便携", size: "200g / 罐", price: 260, image: "/assets/products/white-loose.png", subcategory: "老树白茶" },
      { name: "月上枝欧盟有机白茶", note: "欧标茶园，毫香清鲜", size: "50g / 罐", price: 198, image: "/assets/products/white-wrapped.png", subcategory: "有机白茶", tag: "欧标" },
      { name: "白鹭山大树白茶", note: "花香轻盈，回甘细长", size: "357g / 饼", price: 298, image: "/assets/products/white-loose.png", subcategory: "有机白茶" },
    ],
  },
  {
    name: "普洱生茶",
    note: "山野兰香 · 回甘生津",
    subcategories: ["全部", "古树生茶", "名山茶"],
    products: [
      { name: "2023 大雪山高杆古树生茶", note: "高香清劲，甜润耐泡", size: "200g / 饼", price: 198, image: "/assets/products/raw-cake.png", subcategory: "古树生茶", tag: "春茶" },
      { name: "2021 梅子箐普洱生茶", note: "梅香清雅，回甘鲜明", size: "357g / 饼", price: 680, image: "/assets/products/raw-wrapped.png", subcategory: "名山茶" },
      { name: "2023 忙肺正山古树生茶", note: "香高味厚，山韵清晰", size: "200g / 饼", price: 680, image: "/assets/products/raw-cake.png", subcategory: "古树生茶" },
      { name: "2015 云山邀大雪山古树生茶", note: "陈韵初显，汤感绵长", size: "357g / 饼", price: 620, image: "/assets/products/raw-wrapped.png", subcategory: "名山茶", tag: "老茶" },
    ],
  },
  {
    name: "普洱熟茶",
    note: "醇厚温润 · 枣香木香",
    subcategories: ["全部", "古树熟茶", "欧标小罐"],
    products: [
      { name: "2020 欧标熟茶", note: "干净甜醇，日常顺饮", size: "357g / 饼", price: 298, image: "/assets/products/ripe-cake.png", subcategory: "古树熟茶", tag: "欧标" },
      { name: "2012 大雪山熟茶", note: "陈香沉稳，汤质顺滑", size: "357g / 饼", price: 598, image: "/assets/products/ripe-cake.png", subcategory: "古树熟茶" },
      { name: "2024 冰岛地界熟茶", note: "甜糯细腻，温润耐泡", size: "200g / 饼", price: 798, image: "/assets/products/ripe-tin.png", subcategory: "古树熟茶", tag: "新品" },
      { name: "欧标小爱心熟茶", note: "便携小沱，一粒一泡", size: "100g / 罐", price: 128, image: "/assets/products/ripe-tin.png", subcategory: "欧标小罐" },
    ],
  },
  {
    name: "红茶",
    note: "蜜甜花香 · 温暖醇柔",
    subcategories: ["全部", "古树烤红", "野生晒红"],
    products: [
      { name: "枕涵香欧盟有机老树红茶", note: "蜜香清甜，柔润鲜活", size: "100g / 罐", price: 168, image: "/assets/products/red-tin.png", subcategory: "古树烤红", tag: "欧标" },
      { name: "东方骑百年古树烤红", note: "焦糖甜香，醇厚温暖", size: "100g / 罐", price: 158, image: "/assets/products/red-jar.png", subcategory: "古树烤红" },
      { name: "荒野红百年古树晒红", note: "日晒果香，山野气息", size: "100g / 罐", price: 198, image: "/assets/products/red-jar.png", subcategory: "野生晒红", tag: "人气" },
      { name: "千岁红千年野生古树晒红", note: "陈甜深邃，余韵悠长", size: "100g / 罐", price: 698, image: "/assets/products/red-tin.png", subcategory: "野生晒红" },
    ],
  },
  {
    name: "花茶",
    note: "鲜花窨制 · 香入茶骨",
    subcategories: ["全部", "茉莉花茶", "桂花玫瑰"],
    products: [
      { name: "欧标茉莉红螺", note: "花香清透，甜润耐泡", size: "100g / 罐", price: 298, image: "/assets/products/jasmine-tin.png", subcategory: "茉莉花茶", tag: "窨制" },
      { name: "欧标茉莉银针", note: "银针细嫩，香气轻盈", size: "50g / 罐", price: 228, image: "/assets/products/jasmine-tin.png", subcategory: "茉莉花茶" },
      { name: "欧标桂花红茶", note: "桂香温柔，蜜甜顺口", size: "100g / 罐", price: 298, image: "/assets/products/rose-jar.png", subcategory: "桂花玫瑰" },
      { name: "墨红玫瑰红茶", note: "玫瑰馥郁，汤感柔和", size: "100g / 罐", price: 260, image: "/assets/products/rose-jar.png", subcategory: "桂花玫瑰", tag: "花香" },
    ],
  },
  {
    name: "绿茶",
    note: "鲜爽清雅 · 春日嫩香",
    subcategories: ["全部", "高山绿茶", "春尖"],
    products: [
      { name: "山岚欧标黄芽绿茶", note: "嫩香鲜爽，清甜明亮", size: "50g / 罐", price: 168, image: "/assets/products/green-tin.png", subcategory: "高山绿茶", tag: "春茶" },
      { name: "无量山春尖", note: "芽尖细嫩，栗香清鲜", size: "100g / 罐", price: 198, image: "/assets/products/green-jar.png", subcategory: "春尖" },
      { name: "景迈云雾绿茶", note: "兰香轻柔，入口鲜甜", size: "50g / 罐", price: 188, image: "/assets/products/green-tin.png", subcategory: "高山绿茶" },
    ],
  },
  {
    name: "茶膏",
    note: "一颗一泡 · 随身茶席",
    subcategories: ["全部", "普洱茶膏", "花香茶膏"],
    products: [
      { name: "普洱熟茶膏", note: "醇厚便携，冷热皆宜", size: "50g / 袋", price: 260, image: "/assets/products/paste-box.png", subcategory: "普洱茶膏", tag: "纯茶" },
      { name: "茉莉普洱熟茶膏", note: "茉莉清香，温润顺口", size: "25g / 袋", price: 198, image: "/assets/products/paste-jar.png", subcategory: "花香茶膏" },
      { name: "陈皮普洱熟茶膏", note: "陈皮清润，熟茶醇甜", size: "50g / 袋", price: 268, image: "/assets/products/paste-box.png", subcategory: "普洱茶膏" },
      { name: "玫瑰普洱熟茶膏", note: "玫瑰柔香，轻甜易饮", size: "25g / 袋", price: 198, image: "/assets/products/paste-jar.png", subcategory: "花香茶膏" },
    ],
  },
  {
    name: "礼盒",
    note: "多味组合 · 体面茶礼",
    subcategories: ["全部", "九宫格", "二十宫格"],
    products: [
      { name: "6 泡茉莉红礼盒", note: "轻巧茶礼，六席花香", size: "6g × 6 / 盒", price: 188, image: "/assets/products/paste-box.png", subcategory: "九宫格" },
      { name: "欧标有机白茶九宫格套装", note: "九种风味，一盒尝鲜", size: "6g × 9 / 盒", price: 266, image: "/assets/products/gift-nine.png", subcategory: "九宫格", tag: "茶礼" },
      { name: "欧标有机白茶二十宫格套装", note: "一盒二十席，分享更从容", size: "6g × 20 / 盒", price: 400, image: "/assets/products/gift-twenty.png", subcategory: "二十宫格" },
      { name: "红白生熟茶组合礼盒", note: "四类经典茶，一次集齐", size: "9g × 20 / 盒", price: 798, image: "/assets/products/gift-twenty.png", subcategory: "二十宫格", tag: "甄选" },
    ],
  },
];

function SectionTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action?: string }) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action ? (
        <button className="text-action" type="button">
          {action}<ChevronRightIcon />
        </button>
      ) : null}
    </div>
  );
}

function HomeScreen({ onTab, onMember, onAction }: { onTab: (tab: TabId) => void; onMember: () => void; onAction: (title: string) => void }) {
  return (
    <MobileScroll className="app-scroll">
      <main className="home-screen" data-testid="home-screen">
        <section className="hero" aria-label="云雾茶山品牌主视觉">
          <img src="/assets/tea-mountain-hero.png" alt="云雾环绕的云南高山茶园" />
          <div className="hero-topline">
            <span>YU TEA · 予茶</span>
            <button className="mini-capsule" type="button" aria-label="小程序菜单与分享" onClick={() => onAction("分享予茶") }><DotsHorizontalIcon /><span /><CircleIcon /></button>
          </div>
          <div className="hero-copy">
            <img className="hero-mark" src="/assets/brand/yu-mark-white.png" alt="予茶品牌标识" />
            <p>数字化转型的新茶道</p>
            <h1>一叶连山海<br />一席聚知己</h1>
            <span className="hero-en">A NEW RITUAL FOR TEA LIFE</span>
          </div>
          <section className="gateway" aria-label="主要入口">
            <button type="button" onClick={onMember}>
              <span className="gateway-kicker">MEMBERSHIP</span>
              <strong>入会领茶礼</strong>
              <small>会员价 · 茶分 · 专属券</small>
            </button>
            <span className="gateway-rule" />
            <button type="button" onClick={() => onTab("shop") }>
              <span className="gateway-kicker">WORLDWIDE</span>
              <strong>选茶寄世界</strong>
              <small>跨境直邮 · 溯源码</small>
            </button>
          </section>
        </section>

        <section className="paper-section quick-section">
          <SectionTitle eyebrow="MEMBER BENEFITS" title="懂你的每一次茶叙" />
          <div className="quick-grid">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.label} type="button" onClick={() => onAction(item.label)}>
                  <span className="quick-icon"><Icon /></span>
                  <strong>{item.label}</strong>
                  <small>{item.note}</small>
                </button>
              );
            })}
          </div>
        </section>

        <section className="paper-section member-feature">
          <img src="/assets/tea-product-stilllife.png" alt="白茶饼与盖碗茶席" />
          <div className="feature-copy">
            <span className="eyebrow">PRIVATE OFFER · 会员专享</span>
            <h2>山野白茶拼团</h2>
            <p>三人成团，和同频的人共享一席山野清甜。</p>
            <div className="feature-row">
              <div><strong>¥168</strong><s>¥239</s></div>
              <button type="button" onClick={() => onAction("发起拼团")}>立即成团</button>
            </div>
          </div>
        </section>

        <section className="dark-section live-card">
          <div className="live-badge"><span /> LIVE · 今晚 20:00</div>
          <span className="eyebrow">TEA SALON</span>
          <h2>跟着制茶师<br />云游景迈山</h2>
          <p>直播、公众号与社群同步开席，边听山场故事，边选一款懂你的茶。</p>
          <button type="button" onClick={() => onTab("live")}><PlayIcon />预约茶会</button>
        </section>

        <section className="paper-section origin-section">
          <SectionTitle eyebrow="ORIGIN & CULTURE" title="一片叶子的来处" action="查看溯源" />
          <button className="origin-card" type="button" onClick={() => onAction("产品溯源") }>
            <img src="/assets/tea-origin-culture.png" alt="茶农在高山茶园采摘嫩芽" />
            <span className="origin-copy">
              <strong>古茶林共生的秘密</strong>
              <small>海拔 1,680m · 采摘批次 YM260318</small>
            </span>
          </button>
        </section>

        <section className="paper-section collaboration-section">
          <SectionTitle eyebrow="TEA LIFE COLLAB" title="茶生活，不止一杯茶" />
          <Carousel ariaLabel="跨界合作" className="collab-carousel" contentClassName="collab-track">
            <button type="button" className="collab-card clay" onClick={() => onAction("器物联名") }>
              <span>器物联名</span><strong>一只为岩茶而生的杯</strong><small>予茶 × 青岚窑</small>
            </button>
            <button type="button" className="collab-card herb" onClick={() => onAction("轻养茶食") }>
              <span>轻养茶食</span><strong>低糖桂花茶点礼盒</strong><small>予茶 × 山食记</small>
            </button>
          </Carousel>
        </section>
      </main>
    </MobileScroll>
  );
}

const qiansuihongName = "千岁红千年野生古树晒红";

function DetailActionBar({
  product,
  favorite,
  onToggleFavorite,
  onAdd,
  cartCount,
}: {
  product: TeaProduct;
  favorite: boolean;
  onToggleFavorite: () => void;
  onAdd: () => number;
  cartCount: number;
}) {
  const [feedbackCount, setFeedbackCount] = useState<number | null>(null);
  const feedbackTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
  }, []);

  const addWithFeedback = () => {
    const nextCount = onAdd();
    setFeedbackCount(nextCount);
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setFeedbackCount(null), 1800);
  };

  return (
    <>
      <div className="detail-added-toast" data-visible={feedbackCount !== null} role="status" aria-live="polite">
        {feedbackCount !== null ? `已加入购物车 · 共 ${feedbackCount} 件茶品` : ""}
      </div>
      <footer className="detail-buybar" data-added={feedbackCount !== null}>
        <div className="detail-price"><small>{product.size}</small><strong>¥{product.price}</strong></div>
        <button className="detail-favorite" type="button" aria-label={`${favorite ? "取消收藏" : "收藏"}${product.name}`} aria-pressed={favorite} data-active={favorite} onClick={onToggleFavorite}>
          <StarIcon /><span>{favorite ? "已收藏" : "收藏"}</span>
        </button>
        <button className="detail-cart" type="button" aria-label={`将${product.name}加入购物车`} onClick={addWithFeedback}>
          <BackpackIcon /><span>加入购物车<small>{cartCount ? `共 ${cartCount} 件` : "加入茶席"}</small></span>
        </button>
      </footer>
    </>
  );
}

function StandardProductDetail({
  product,
  group,
  onBack,
  onAdd,
  onAction,
  favorite,
  onToggleFavorite,
  cartCount,
}: {
  product: TeaProduct;
  group: TeaGroup;
  onBack: () => void;
  onAdd: () => number;
  onAction: (title: string) => void;
  favorite: boolean;
  onToggleFavorite: () => void;
  cartCount: number;
}) {
  return (
    <section className="standard-detail detail-layer" data-testid="product-detail" data-product-name={product.name}>
      <MobileScroll className="standard-detail-scroll">
        <main className="standard-detail-page">
          <header className="standard-detail-header">
            <button type="button" aria-label="返回选茶" onClick={onBack}><ChevronLeftIcon /></button>
            <span>YU TEA · SELECTED {group.name.toUpperCase()}</span>
            <button type="button" aria-label={`分享${product.name}`} onClick={() => onAction(`分享${product.name}`)}><Share1Icon /></button>
          </header>

          <section className="standard-product-hero">
            <span className="standard-detail-kicker">{product.subcategory} · {group.name}</span>
            <div className="standard-product-image"><img src={product.image} alt={product.name} /></div>
            {product.tag ? <span className="standard-product-tag">{product.tag}</span> : null}
            <h1>{product.name}</h1>
            <p>{product.note}</p>
            <small>{product.size}</small>
          </section>

          <section className="standard-detail-story">
            <span>TEA PROFILE · 风味轮廓</span>
            <h2>一席茶里的<br />本真风味</h2>
            <p>{product.note}。以清透的香气、温润的汤感与细长回味，呈现予茶对每一片原叶的认真选择。</p>
          </section>

          <section className="standard-detail-info">
            <article><span>01</span><div><h3>建议冲泡</h3><p>使用洁净热水温润茶具，少量多次出汤，根据个人口味调整浸泡时间。</p></div></article>
            <article><span>02</span><div><h3>安心溯源</h3><p>正式商品可接入批次溯源码，查看产地、采摘与加工信息。</p></div></article>
          </section>
        </main>
      </MobileScroll>

      <DetailActionBar product={product} favorite={favorite} onToggleFavorite={onToggleFavorite} onAdd={onAdd} cartCount={cartCount} />
    </section>
  );
}

function QiansuihongDetail({
  product,
  onBack,
  onAdd,
  onAction,
  favorite,
  onToggleFavorite,
  cartCount,
}: {
  product: TeaProduct;
  onBack: () => void;
  onAdd: () => number;
  onAction: (title: string) => void;
  favorite: boolean;
  onToggleFavorite: () => void;
  cartCount: number;
}) {
  return (
    <section className="qiansui-detail detail-layer" data-testid="qiansuihong-detail">
      <MobileScroll className="qiansui-scroll">
        <main className="qiansui-page">
          <section className="qiansui-hero" aria-label="千岁红千年野生古树红茶">
            <img src="/assets/qiansuihong/hero.png?v=2" alt="千年野生古茶树与陶土红茶罐" />
            <div className="qiansui-hero-actions">
              <button type="button" aria-label="返回选茶" onClick={onBack}><ChevronLeftIcon /></button>
              <button type="button" aria-label="分享千岁红" onClick={() => onAction("分享千岁红") }><Share1Icon /></button>
            </div>
            <div className="qiansui-hero-copy">
              <span>WILD TREE RED TEA</span>
              <h1>千岁红</h1>
              <h2>千年野生古树红茶</h2>
              <i />
              <p>喝到的，仿佛是时间的味道</p>
            </div>
          </section>

          <section className="qiansui-facts" aria-label="千岁红产地信息">
            <div><span>产地</span><strong>临沧</strong></div>
            <div><span>品种</span><strong>大理种</strong></div>
            <div><span>海拔</span><strong>约 2000m</strong></div>
            <div><span>树龄</span><strong>1000 多年</strong></div>
          </section>

          <section className="qiansui-aroma">
            <div>
              <span className="qiansui-kicker">AROMA · 山野气韵</span>
              <h2>野蜜香贯穿始末</h2>
              <i />
              <p>玫瑰 · 番石榴 · 花果香</p>
            </div>
            <img src="/assets/qiansuihong/dry-tea-plate.png" alt="白瓷盘中的乌黑油亮千岁红干茶" />
          </section>

          <section className="qiansui-story">
            <span className="qiansui-kicker">01 · WILD ORIGIN</span>
            <h2>原始森林里的<br />千年野性</h2>
            <p>在人迹罕至的云南高山密林中，野生大茶树自然繁衍成万亩茶林。山谷、清溪与多样生物共生，让每一片叶子都带着森林山野的气韵。</p>
            <blockquote>“野”，是没有边界的想象，也是自然本身的力量。</blockquote>
          </section>

          <section className="qiansui-species">
            <div>
              <span className="qiansui-kicker">02 · CAMELLIA TALIENSIS</span>
              <h2>大理种，未经驯化的古木兰</h2>
              <p>嫩芽与嫩叶没有绒毛，干茶乌黑油亮、叶质如革，果胶丰厚。生长十几年，才及普通茶树两三年的高度。</p>
            </div>
            <img src="/assets/qiansuihong/dry-tea.jpg" alt="大理种野生红茶干茶细节" />
          </section>

          <section className="qiansui-tasting">
            <img src="/assets/qiansuihong/tea-liquor.jpg" alt="明亮金黄的千岁红茶汤" />
            <div>
              <span className="qiansui-kicker">03 · A WORLD IN A CUP</span>
              <h2>鲜爽、甘甜、柔润</h2>
              <p>更高的茶黄素带来明亮浅金汤色。玫瑰、番石榴与野蜜香落入茶汤，十泡之后仍不落茶色，鲜甜依旧。</p>
            </div>
          </section>

          <section className="qiansui-features" aria-label="千岁红主要特点">
            <span className="qiansui-kicker">FIVE CHARACTERISTICS</span>
            <h2>一杯茶里的千年积淀</h2>
            <ol>
              <li><strong>01</strong><span>千年树龄<br /><small>产量稀少</small></span></li>
              <li><strong>02</strong><span>野韵十足<br /><small>山野气深</small></span></li>
              <li><strong>03</strong><span>甜润度高<br /><small>甘甜厚重</small></span></li>
              <li><strong>04</strong><span>十分耐泡<br /><small>十泡仍甜</small></span></li>
              <li><strong>05</strong><span>回甘生津<br /><small>喉韵绵长</small></span></li>
            </ol>
          </section>

          <section className="qiansui-leaf">
            <img src="/assets/qiansuihong/leaf-base.jpg" alt="明亮油润且柔韧的千岁红叶底" />
            <div><span className="qiansui-kicker">04 · LEAF BASE</span><h2>明亮油润，柔韧有光</h2><p>茶气劲扬饱满，释放缓慢而持久。古乔木独特的茶韵，让余香与回甘久久停留。</p></div>
          </section>
        </main>
      </MobileScroll>

      <DetailActionBar product={product} favorite={favorite} onToggleFavorite={onToggleFavorite} onAdd={onAdd} cartCount={cartCount} />
    </section>
  );
}

function ShopScreen({
  onAction,
  favoriteNames,
  onToggleFavorite,
  cartItems,
  setCartItems,
  onCheckout,
}: {
  onAction: (title: string) => void;
  favoriteNames: string[];
  onToggleFavorite: (name: string) => void;
  cartItems: CartLine[];
  setCartItems: React.Dispatch<React.SetStateAction<CartLine[]>>;
  onCheckout: () => void;
}) {
  const [category, setCategory] = useState(teaCatalog[0].name);
  const [cartOpen, setCartOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<TeaProduct | null>(null);
  const activeGroup = teaCatalog.find((group) => group.name === category) ?? teaCatalog[0];
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  useEffect(() => {
    if (!detailProduct) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
    const screen = document.querySelector<HTMLElement>('[data-testid="device-screen"]');
    if (screen) screen.scrollTop = 0;
  }, [detailProduct]);

  const chooseCategory = (nextCategory: TeaGroup) => {
    setCategory(nextCategory.name);
  };

  const addToCart = (product: TeaProduct) => {
    setCartItems((items) => {
      const existing = items.find((item) => item.product.name === product.name);
      if (existing) return items.map((item) => item.product.name === product.name ? { ...item, quantity: item.quantity + 1 } : item);
      return [...items, { product, quantity: 1 }];
    });
  };

  const changeQuantity = (productName: string, delta: number) => {
    setCartItems((items) => items.flatMap((item) => {
      if (item.product.name !== productName) return [item];
      const quantity = item.quantity + delta;
      return quantity > 0 ? [{ ...item, quantity }] : [];
    }));
  };

  const removeFromCart = (productName: string) => {
    setCartItems((items) => items.filter((item) => item.product.name !== productName));
  };

  const checkout = () => {
    if (!cartCount) {
      onAction("请先选购茶品");
      return;
    }
    setCartOpen(false);
    onCheckout();
  };

  const openProduct = (product: TeaProduct) => {
    setDetailProduct(product);
  };

  if (detailProduct) {
    const detailGroup = teaCatalog.find((group) => group.products.some((product) => product.name === detailProduct.name)) ?? activeGroup;
    const detailProps = {
      product: detailProduct,
      onBack: () => setDetailProduct(null),
      onAdd: () => {
        const nextCount = cartCount + 1;
        addToCart(detailProduct);
        return nextCount;
      },
      onAction,
      favorite: favoriteNames.includes(detailProduct.name),
      onToggleFavorite: () => onToggleFavorite(detailProduct.name),
      cartCount,
    };

    if (detailProduct.name !== qiansuihongName) {
      return <StandardProductDetail {...detailProps} group={detailGroup} />;
    }

    return (
      <QiansuihongDetail
        {...detailProps}
      />
    );
  }

  return (
    <section className="shop-shell" data-testid="shop-screen" data-cart-open={cartOpen}>
      <header className="shop-header">
        <div><span className="eyebrow">SELECTED TEA</span><h1>予茶选品</h1></div>
        <button type="button" onClick={() => onAction("跨境直邮") }><GlobeIcon /><span>跨境直邮</span></button>
      </header>

      <aside className="category-rail" aria-label="茶叶分类">
        {teaCatalog.map((group) => (
          <div className="category-group" key={group.name}>
            <button type="button" className="category-primary" data-active={group.name === category} onClick={() => chooseCategory(group)}>{group.name}</button>
          </div>
        ))}
      </aside>

      <MobileScroll className="shop-product-scroll">
        <main className="shop-product-column">
          <div className="catalog-heading">
            <span>{activeGroup.name}</span>
            <h2>本类精选</h2>
            <p>{activeGroup.note}</p>
          </div>
          <div className="product-list">
            {activeGroup.products.map((product) => (
              <article className="catalog-product" key={product.name}>
                <button className="catalog-product-main" type="button" aria-label={`查看${product.name}`} onClick={() => openProduct(product)}>
                  <img src={product.image} alt="" />
                  <span className="catalog-product-copy">
                    {product.tag ? <span className="product-tag">{product.tag}</span> : null}
                    <h3>{product.name}</h3>
                    <p>{product.note}</p>
                    <small>{product.size}</small>
                    <strong>¥{product.price}</strong>
                  </span>
                </button>
                <button className="add-product" type="button" aria-label={`将${product.name}加入购物车`} onClick={() => addToCart(product)}><PlusIcon /></button>
              </article>
            ))}
          </div>
        </main>
      </MobileScroll>

      <div className="shop-cart-bar" data-empty={cartCount === 0}>
        <button className="cart-summary" type="button" onClick={() => cartCount ? setCartOpen(true) : onAction("购物车还是空的") }>
          <span className="cart-icon"><BackpackIcon />{cartCount ? <b>{cartCount}</b> : null}</span>
          <span><strong>¥{cartTotal}</strong><small>{cartCount ? `已选 ${cartCount} 件茶品` : "请先选购茶品"}</small></span>
        </button>
        <button className="cart-checkout" type="button" onClick={checkout}>去结算</button>
      </div>

      <BottomSheet open={cartOpen} onOpenChange={setCartOpen} title={`购物车 · ${cartCount} 件茶品`} description="已选商品可在这里调整数量" snap={1}>
        <div className="cart-sheet-content">
          {cartItems.length ? (
            <div className="cart-sheet-list">
              {cartItems.map(({ product, quantity }) => (
                <article className="cart-sheet-item" key={product.name}>
                  <img src={product.image} alt={product.name} />
                  <div className="cart-sheet-product">
                    <h3>{product.name}</h3>
                    <small>{product.size}</small>
                    <strong>¥{product.price}</strong>
                  </div>
                  <div className="cart-sheet-actions">
                    <button className="cart-remove" type="button" aria-label={`删除${product.name}`} onClick={() => removeFromCart(product.name)}><TrashIcon /></button>
                    <div className="cart-quantity" aria-label={`${product.name}数量`}>
                      <button type="button" aria-label={`减少${product.name}数量`} onClick={() => changeQuantity(product.name, -1)}><MinusIcon /></button>
                      <span>{quantity}</span>
                      <button type="button" aria-label={`增加${product.name}数量`} onClick={() => changeQuantity(product.name, 1)}><PlusIcon /></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="cart-empty"><BackpackIcon /><p>购物车还是空的</p></div>}
          <div className="cart-sheet-footer">
            <div><span>合计</span><strong>¥{cartTotal}</strong><small>已选 {cartCount} 件茶品</small></div>
            <button type="button" disabled={!cartCount} onClick={checkout}>去结算</button>
          </div>
        </div>
      </BottomSheet>
    </section>
  );
}

function CheckoutScreen({
  cartItems,
  onBack,
  onPaid,
  onContinue,
  onViewOrders,
}: {
  cartItems: CartLine[];
  onBack: () => void;
  onPaid: () => void;
  onContinue: () => void;
  onViewOrders: () => void;
}) {
  const [deliveryMode, setDeliveryMode] = useState<"domestic" | "cross">("domestic");
  const [receipt, setReceipt] = useState<{ amount: number; count: number } | null>(null);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const goodsTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const couponDiscount = goodsTotal >= 199 ? 30 : 0;
  const pointsDiscount = goodsTotal ? 8 : 0;
  const shippingFee = deliveryMode === "cross" ? 48 : 0;
  const payable = Math.max(0, goodsTotal + shippingFee - couponDiscount - pointsDiscount);

  const pay = () => {
    if (!cartCount) return;
    setReceipt({ amount: payable, count: cartCount });
    onPaid();
  };

  if (receipt) {
    return (
      <section className="checkout-layer checkout-success" data-testid="checkout-success">
        <div className="checkout-success-mark"><CheckCircledIcon /></div>
        <span>ORDER CONFIRMED</span>
        <h1>这一席茶<br />已经为你留好</h1>
        <p>订单已提交，我们会在发货后同步物流消息。<br />本次获得 {Math.floor(receipt.amount)} 茶分。</p>
        <div className="checkout-order-no"><span>订单编号</span><strong>YU20260824{String(receipt.count).padStart(2, "0")}</strong></div>
        <button className="checkout-success-primary" type="button" onClick={onViewOrders}>查看订单</button>
        <button className="checkout-success-secondary" type="button" onClick={onContinue}>继续选茶</button>
      </section>
    );
  }

  return (
    <section className="checkout-layer" data-testid="checkout-screen">
      <header className="checkout-header">
        <button type="button" aria-label="返回购物车" onClick={onBack}><ChevronLeftIcon /></button>
        <div><span>CHECKOUT</span><h1>确认订单</h1></div>
        <LockClosedIcon />
      </header>

      <MobileScroll className="checkout-scroll">
        <main className="checkout-page">
          <section className="checkout-address">
            <SewingPinIcon />
            <div><span>收货信息</span><strong>予茶会员 · 138****8899</strong><p>云南省昆明市盘龙区 · 微信地址示意</p></div>
            <ChevronRightIcon />
          </section>

          <section className="checkout-delivery">
            <div className="checkout-section-title"><span>DELIVERY</span><h2>配送方式</h2></div>
            <div className="delivery-options">
              <button type="button" data-active={deliveryMode === "domestic"} onClick={() => setDeliveryMode("domestic")}><strong>境内配送</strong><small>满 ¥199 包邮</small></button>
              <button type="button" data-active={deliveryMode === "cross"} onClick={() => setDeliveryMode("cross")}><strong>跨境直邮</strong><small>运费 ¥48 · 税费以海关为准</small></button>
            </div>
          </section>

          <section className="checkout-products">
            <div className="checkout-section-title"><span>YOUR TEA</span><h2>{cartCount} 件茶品</h2></div>
            {cartItems.map(({ product, quantity }) => (
              <article key={product.name}>
                <img src={product.image} alt={product.name} />
                <div><h3>{product.name}</h3><small>{product.size} · ×{quantity}</small></div>
                <strong>¥{product.price * quantity}</strong>
              </article>
            ))}
          </section>

          <section className="checkout-benefits">
            <div><span>会员茶礼券</span><strong>{couponDiscount ? `−¥${couponDiscount}` : "暂无可用"}</strong></div>
            <div><span>茶分抵扣</span><strong>{pointsDiscount ? `860 茶分 · −¥${pointsDiscount}` : "未使用"}</strong></div>
            <div><span>支付方式</span><strong>微信支付 <ChevronRightIcon /></strong></div>
          </section>

          <section className="checkout-summary">
            <div><span>商品金额</span><strong>¥{goodsTotal}</strong></div>
            <div><span>优惠抵扣</span><strong>−¥{couponDiscount + pointsDiscount}</strong></div>
            <div><span>配送费</span><strong>{shippingFee ? `¥${shippingFee}` : "包邮"}</strong></div>
            <div className="checkout-summary-total"><span>应付金额</span><strong>¥{payable}</strong></div>
          </section>
        </main>
      </MobileScroll>

      <footer className="checkout-paybar">
        <div><small>合计</small><strong>¥{payable}</strong></div>
        <button type="button" onClick={pay}><LockClosedIcon />微信支付 · ¥{payable}</button>
      </footer>
    </section>
  );
}

function LiveScreen({ onAction }: { onAction: (title: string) => void }) {
  return (
    <MobileScroll className="app-scroll">
      <main className="sub-screen community-screen" data-testid="live-screen">
        <span className="eyebrow">PRIVATE TEA COMMUNITY</span>
        <h1>把茶会<br />搬到云端</h1>
        <p className="intro">直播听茶、社群共学、公众号慢读，让每一次互动都成为长期关系。</p>
        <article className="live-hero">
          <img src="/assets/tea-origin-culture.png" alt="云南茶园采摘现场" />
          <span className="live-badge"><span /> 直播预告</span>
          <div><strong>今晚 20:00</strong><h2>春茶为什么贵？<br />跟制茶师进一次茶山</h2></div>
          <button type="button" onClick={() => onAction("预约成功") }><ClockIcon />预约提醒</button>
        </article>
        <section className="community-list">
          <SectionTitle eyebrow="TOGETHER" title="你的茶友圈" />
          <button type="button" onClick={() => onAction("加入社群") }><ChatBubbleIcon /><span><strong>景迈山春茶共学群</strong><small>286 位茶友正在讨论兰香</small></span><ChevronRightIcon /></button>
          <button type="button" onClick={() => onAction("阅读公众号") }><RocketIcon /><span><strong>本周慢读：茶与睡眠</strong><small>品牌公众号精选 · 8 分钟</small></span><ChevronRightIcon /></button>
        </section>
      </main>
    </MobileScroll>
  );
}

function MeScreen({ onAction, favorites }: { onAction: (title: string) => void; favorites: TeaProduct[] }) {
  const [favoritesOpen, setFavoritesOpen] = useState(true);

  return (
    <MobileScroll className="app-scroll">
      <main className="sub-screen me-screen" data-testid="me-screen">
        <span className="eyebrow">MY TEA LIFE</span>
        <div className="profile-head"><div className="avatar">予</div><div><h1>下午好，茶友</h1><p>山席会员 · Lv.2</p></div></div>
        <section className="points-card"><span>可用茶分</span><strong>860</strong><button type="button" onClick={() => onAction("茶分兑礼")}>去兑礼</button></section>
        <div className="order-strip">
          <button type="button" onClick={() => onAction("待付款") }><strong>1</strong><span>待付款</span></button>
          <button type="button" onClick={() => onAction("待收茶") }><strong>2</strong><span>待收茶</span></button>
          <button type="button" onClick={() => onAction("优惠券") }><strong>5</strong><span>优惠券</span></button>
        </div>
        <section className="menu-list">
          <button type="button" onClick={() => onAction("我的拼团")}><span>我的拼团</span><ChevronRightIcon /></button>
          <button className="favorites-toggle" type="button" aria-expanded={favoritesOpen} onClick={() => setFavoritesOpen((open) => !open)}>
            <span>我的收藏</span><span className="favorites-count">{favorites.length} 件</span><ChevronRightIcon />
          </button>
          {favoritesOpen ? (
            <div className="favorites-panel" data-testid="favorites-panel">
              {favorites.length ? favorites.map((product) => (
                <article className="favorite-product" key={product.name}>
                  <img src={product.image} alt={product.name} />
                  <div><span>{teaCatalog.find((group) => group.products.some((item) => item.name === product.name))?.name ?? "予茶"} · YU TEA SELECTED</span><h3>{product.name}</h3><small>{product.size}</small><strong>¥{product.price}</strong></div>
                </article>
              )) : <p className="favorites-empty">收藏喜欢的茶，下一次更快找到它。</p>}
            </div>
          ) : null}
          {["产品溯源记录", "跨境物流", "会员权益说明"].map((item) => (
            <button key={item} type="button" onClick={() => onAction(item)}><span>{item}</span><ChevronRightIcon /></button>
          ))}
        </section>
      </main>
    </MobileScroll>
  );
}

export default function Prototype() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [sheet, setSheet] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartLine[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = JSON.parse(window.localStorage.getItem("yuTeaCartItems") ?? "[]");
      if (!Array.isArray(saved)) return [];
      const products = teaCatalog.flatMap((group) => group.products);
      return saved.flatMap((line): CartLine[] => {
        const name = typeof line?.name === "string" ? line.name : line?.product?.name;
        const product = products.find((item) => item.name === name);
        const quantity = Number(line?.quantity);
        return product && Number.isFinite(quantity) && quantity > 0 ? [{ product, quantity }] : [];
      });
    } catch {
      return [];
    }
  });
  const [favoriteNames, setFavoriteNames] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = JSON.parse(window.localStorage.getItem("yuTeaFavorites") ?? "[]");
      return Array.isArray(saved) ? saved.filter((name): name is string => typeof name === "string") : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem("yuTeaFavorites", JSON.stringify(favoriteNames));
  }, [favoriteNames]);

  useEffect(() => {
    window.localStorage.setItem("yuTeaCartItems", JSON.stringify(cartItems.map(({ product, quantity }) => ({ name: product.name, quantity }))));
  }, [cartItems]);

  const toggleFavorite = (name: string) => {
    setFavoriteNames((names) => names.includes(name) ? names.filter((item) => item !== name) : [...names, name]);
  };

  const favoriteProducts = useMemo(
    () => teaCatalog.flatMap((group) => group.products).filter((product) => favoriteNames.includes(product.name)),
    [favoriteNames],
  );

  const screen = useMemo(() => {
    if (checkoutOpen) return (
      <CheckoutScreen
        cartItems={cartItems}
        onBack={() => setCheckoutOpen(false)}
        onPaid={() => setCartItems([])}
        onContinue={() => { setCheckoutOpen(false); setActiveTab("shop"); }}
        onViewOrders={() => { setCheckoutOpen(false); setActiveTab("me"); setSheet("订单已提交"); }}
      />
    );
    if (activeTab === "shop") return <ShopScreen onAction={setSheet} favoriteNames={favoriteNames} onToggleFavorite={toggleFavorite} cartItems={cartItems} setCartItems={setCartItems} onCheckout={() => setCheckoutOpen(true)} />;
    if (activeTab === "live") return <LiveScreen onAction={setSheet} />;
    if (activeTab === "me") return <MeScreen onAction={setSheet} favorites={favoriteProducts} />;
    return <HomeScreen onTab={setActiveTab} onMember={() => setSheet("欢迎加入山席会员")} onAction={setSheet} />;
  }, [activeTab, cartItems, checkoutOpen, favoriteNames, favoriteProducts]);

  return (
    <div className="tea-app" data-testid="tea-app">
      {screen}
      {!checkoutOpen ? <nav className="tab-bar" aria-label="主要导航">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} type="button" data-active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
              <Icon /><span>{tab.label}</span>
            </button>
          );
        })}
      </nav> : null}
      <BottomSheet open={Boolean(sheet)} onOpenChange={(open) => !open && setSheet(null)} title={sheet ?? ""} description="演示交互已连接，正式上线时可接入微信会员、交易、直播与社群能力。">
        <div className="sheet-content">
          <p>{sheet === "欢迎加入山席会员" ? "新会员已领取 ¥30 茶礼券，并获得 100 茶分。" : "这个入口已经可以响应操作，可继续对接真实业务数据与微信生态能力。"}</p>
          <button type="button" onClick={() => setSheet(null)}>我知道了</button>
        </div>
      </BottomSheet>
    </div>
  );
}
