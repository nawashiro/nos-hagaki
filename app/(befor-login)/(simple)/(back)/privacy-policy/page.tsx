import { H1, P, H2, Ol, Ul } from "@/components/ArticleParts";

export default function PrivacyPolicy() {
  return (
    <>
      <H1>プライバシーポリシー </H1>
      <P>
        運営者は、本ウェブサイト上で提供するサービス（以下、「本サービス」といいます。）における、ユーザーのプライバシー情報の取扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」といいます。）を定めます。
      </P>
      <H2>第 1 条（プライバシー情報） </H2>
      <Ol>
        <li>
          プライバシー情報のうち「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる生年月日やその他の記述等により
          特定の個人を識別できる情報を指します。
        </li>
        <li>
          プライバシー情報のうち「履歴情報および特性情報」とは、上記に定める「個人情報」以外のものをいい、ユーザーの
          IP アドレス、ユーザーの Nostr
          公開鍵、検索した検索キーワード、利用日時、利用方法、利用環境、端末の個体識別情報などといった情報を指します。
        </li>
      </Ol>
      <H2>第 2 条（プライバシー情報の収集方法） </H2>
      <Ol>
        <li>
          ユーザーが本サービスを利用する際、またはページを閲覧する際に、ユーザーの
          IP
          アドレス、利用日時、利用方法、利用環境、端末の個体識別情報などといった、履歴情報および特性情報が本サービスに収集されます。
        </li>
        <li>
          ユーザーが本サービスの提供するサーバーに投稿を行った際に、ユーザーの
          IP アドレス、ユーザーの Nostr
          公開鍵、利用日時、利用方法、利用環境、端末の個体識別情報などの履歴情報および特性情報が本サービスに収集されます。
        </li>
      </Ol>
      <H2>第 3 条（第三者によるプライバシー情報の収集方法） </H2>
      <P>
        ユーザーが本ウェブサイトを利用する際、Nostr
        プロトコルのクライアントとしての機能を提供するために、第三者のリレーサーバーと接続します。このとき、ユーザーの
        Nostr 公開鍵、ユーザーの IP
        アドレス、検索した検索キーワードなどの履歴情報および特性情報を、第三者のリレーサーバーが収集する可能性があります。
      </P>
      <P>
        第三者のリレーサーバーによるプライバシー情報の取扱いについては、各リレーサーバー管理者による告知を参照するか、各リレーサーバーの管理者にお問い合わせください。
      </P>
      <P>
        本サービスを利用する際、標準の動作では以下の第三者のリレーサーバーに接続します。
      </P>
      <Ul>
        <li>wss://nos.lol</li>
        <li>wss://relay.damus.io</li>
        <li>wss://relay-jp.nostr.wirednet.jp</li>
        <li>wss://nostr-relay.nokotaro.com</li>
        <li>wss://nostr.holybea.com</li>
        <li>wss://nostr.fediverse.jp</li>
        <li>wss://yabu.me</li>
      </Ul>
      <H2>第 4 条（プライバシー情報を収集・利用する目的） </H2>
      <P>
        本サービスがプライバシー情報を収集・利用する目的は、以下のとおりです。
      </P>
      <Ol>
        <li>本サービスの提供・運営のため</li>
        <li>
          利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため
        </li>
        <li>上記の利用目的に付随する目的</li>
      </Ol>
      <H2>第 5 条（プライバシー情報の第三者提供） </H2>
      <P>
        運営者は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者にプライバシー情報を提供することはありません。ただし、法令で認められる場合を除きます。
      </P>
      <Ol>
        <li>
          国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき
        </li>
      </Ol>
      <P>
        前項の定めにかかわらず、次に掲げる場合には、当該情報の提供先は第三者に該当しないものとします。
      </P>
      <Ol>
        <li>
          本サービスが利用目的の達成に必要な範囲内においてプライバシー情報の取扱いの全部または一部を委託する場合
        </li>
        <li>サービスの承継に伴ってプライバシー情報が提供される場合</li>
      </Ol>
      <H2>第 6 条（プライバシーポリシーの変更） </H2>
      <Ol>
        <li>
          本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく、変更することができるものとします。
        </li>
        <li>
          運営者が別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
        </li>
      </Ol>
      <P>以上</P>
    </>
  );
}