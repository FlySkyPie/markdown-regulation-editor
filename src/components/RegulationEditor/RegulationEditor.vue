<template>
  <v-container fluid>
    <v-row md="12" class="d-flex flex-column py-5 px-5">
      <div class="d-flex flex-row">
        <h2>簡易法規編輯器</h2>
        <h6 class="font-weight-light">Alpha 1.0.0</h6>
      </div>
      <div>
        使用 Markdown 撰寫法規，按下最下方的下載按鈕，法規就會變成 .odt 檔案囉！
      </div>
    </v-row>
    <v-row md="12" class="px-5">
      <v-dialog v-model="dialog" width="500">
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on">
            <v-icon left dark>mdi-information-outline</v-icon>注意事項
          </v-btn>
        </template>
        <v-card>
          <v-card-title class="headline grey lighten-2">
            編輯器使用注意事項
          </v-card-title>
          <v-card-text>
            本編輯器僅使用部份 Markdown 語法用於描述法規，語法規則如下：
            <ul>
              <li>使用 # (Header 1) 作為法規標題</li>
              <li>使用 ###### (Header 6) 作為法規歷程</li>
              <li>使用 ### (Header 3) 作為法規章節</li>
              <li>使用 4 個空格縮排來描述條文結構（條、項、款、目、之一）</li>
            </ul>
            <p></p>
            <p>預祝立法/修法順利ヽ(*'∀`*)ノ</p>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="dialog = false"> 好喔 </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
    <v-row class="px-5 py-5">
      <v-textarea
        rows="50"
        solo
        name="input-7-7"
        filled
        auto-grow
        label="Solo textarea"
        v-model="markdownContent"
      ></v-textarea>
    </v-row>
    <v-row justify="center">
      <v-btn elevation="2" class="mx-5" v-on:click="downloadMarkdown()"
        >下載原始內容
        <v-icon right dark>mdi-file-download-outline</v-icon>
      </v-btn>
      <v-btn elevation="2" class="mx-5" v-on:click="download()"
        >下載 ODT
        <v-icon right dark>mdi-file-download-outline</v-icon>
      </v-btn>
    </v-row>
    <v-snackbar v-model="snackbar">
      {{ snackbarMsg }}
      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import download from "downloadjs";
import OdtCreator from "../../regulation/OdtCreator";

const createZip = (markdownString) => {
  const promise = OdtCreator.createOdtPromise(markdownString);
  promise.then(function (result) {
    download(
      result.buffer,
      result.name + ".odt",
      "application/vnd.oasis.opendocument.text"
    );
  });
};

const createMarkdown = (markdownString) => {
  const promise = OdtCreator.createOdtPromise(markdownString);
  promise.then(function (result) {
    download(markdownString, result.name + ".md", "plain/text");
  });
};

export default {
  data: () => ({
    markdownContent: OdtCreator.getTestMarkdown(),
    dialog: false,
    snackbar: false,
    snackbarMsg: "Opps! 編譯出錯！",
  }),
  methods: {
    download: function () {
      try {
        createZip(this.markdownContent);
        this.snackbar = true;
        this.snackbarMsg = "檔案生成成功！";
      } catch (error) {
        console.log(error);
        this.snackbar = true;
        this.snackbarMsg = "Opps! 編譯出錯！";
      }
    },
    downloadMarkdown: function () {
      try {
        createMarkdown(this.markdownContent);
        this.snackbar = true;
        this.snackbarMsg = "檔案生成成功！";
      } catch (error) {
        this.snackbar = true;
        this.snackbarMsg = "Opps! 編譯出錯！";
      }
    },
  },
};
</script>

<style scoped>
p {
  font-size: 2em;
  text-align: center;
}
</style>
