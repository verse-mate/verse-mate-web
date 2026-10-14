import manifest0 from "./noticket-20/prototype.json";
import fixtures0_0 from "./noticket-20/fixtures/admin-home-approve.json";
import fixtures0_1 from "./noticket-20/fixtures/admin-home-approve-address-changed.json";
import fixtures0_2 from "./noticket-20/fixtures/admin-home-approve-duplicate.json";
import fixtures0_3 from "./noticket-20/fixtures/admin-home-approve-name-taken.json";
import fixtures0_4 from "./noticket-20/fixtures/admin-home-decline.json";
import fixtures0_5 from "./noticket-20/fixtures/admin-home-no-longer-open.json";
import fixtures0_6 from "./noticket-20/fixtures/admin-home-requests.json";
import fixtures0_7 from "./noticket-20/fixtures/admin-learners-list.json";
import fixtures0_8 from "./noticket-20/fixtures/admin-learners-search.json";
import fixtures0_9 from "./noticket-20/fixtures/admin-lesson-draft-preview.json";
import fixtures0_10 from "./noticket-20/fixtures/admin-lesson-edit.json";
import fixtures0_11 from "./noticket-20/fixtures/admin-lesson-passage-invalid.json";
import fixtures0_12 from "./noticket-20/fixtures/admin-lesson-video-failed.json";
import fixtures0_13 from "./noticket-20/fixtures/admin-lesson-video-refused.json";
import fixtures0_14 from "./noticket-20/fixtures/admin-lesson-video-uploading.json";
import fixtures0_15 from "./noticket-20/fixtures/admin-module-delete-refused.json";
import fixtures0_16 from "./noticket-20/fixtures/admin-module-edit.json";
import fixtures0_17 from "./noticket-20/fixtures/admin-module-emptying-refused.json";
import fixtures0_18 from "./noticket-20/fixtures/admin-module-question-invalid.json";
import fixtures0_19 from "./noticket-20/fixtures/admin-program-empty.json";
import fixtures0_20 from "./noticket-20/fixtures/admin-program-long.json";
import fixtures0_21 from "./noticket-20/fixtures/admin-program-modules.json";
import fixtures0_22 from "./noticket-20/fixtures/admin-program-publish-refused.json";
import fixtures0_23 from "./noticket-20/fixtures/check-changed.json";
import fixtures0_24 from "./noticket-20/fixtures/check-failed.json";
import fixtures0_25 from "./noticket-20/fixtures/check-incomplete.json";
import fixtures0_26 from "./noticket-20/fixtures/check-locked.json";
import fixtures0_27 from "./noticket-20/fixtures/check-long.json";
import fixtures0_28 from "./noticket-20/fixtures/check-open.json";
import fixtures0_29 from "./noticket-20/fixtures/check-passed.json";
import fixtures0_30 from "./noticket-20/fixtures/completion-already-in-program.json";
import fixtures0_31 from "./noticket-20/fixtures/completion-approved.json";
import fixtures0_32 from "./noticket-20/fixtures/completion-declined.json";
import fixtures0_33 from "./noticket-20/fixtures/completion-leader.json";
import fixtures0_34 from "./noticket-20/fixtures/completion-request-form.json";
import fixtures0_35 from "./noticket-20/fixtures/completion-request-open.json";
import fixtures0_36 from "./noticket-20/fixtures/completion-unverified.json";
import fixtures0_37 from "./noticket-20/fixtures/gate-confirm-address.json";
import fixtures0_38 from "./noticket-20/fixtures/gate-offer-new.json";
import fixtures0_39 from "./noticket-20/fixtures/gate-offer-started.json";
import fixtures0_40 from "./noticket-20/fixtures/gate-signed-out.json";
import fixtures0_41 from "./noticket-20/fixtures/lesson-done.json";
import fixtures0_42 from "./noticket-20/fixtures/lesson-locked.json";
import fixtures0_43 from "./noticket-20/fixtures/lesson-long.json";
import fixtures0_44 from "./noticket-20/fixtures/lesson-no-video.json";
import fixtures0_45 from "./noticket-20/fixtures/lesson-unsafe-text.json";
import fixtures0_46 from "./noticket-20/fixtures/lesson-video.json";
import fixtures0_47 from "./noticket-20/fixtures/path-check-open.json";
import fixtures0_48 from "./noticket-20/fixtures/path-completed-new-module.json";
import fixtures0_49 from "./noticket-20/fixtures/path-continue.json";
import fixtures0_50 from "./noticket-20/fixtures/path-leader.json";
import fixtures0_51 from "./noticket-20/fixtures/path-long.json";
import fixtures0_52 from "./noticket-20/fixtures/path-new-lesson-ahead.json";
import fixtures0_53 from "./noticket-20/fixtures/path-new-module-ahead.json";
import fixtures0_54 from "./noticket-20/fixtures/start-intro.json";
import fixtures0_55 from "./noticket-20/fixtures/start-not-open.json";

type Issue = {
  manifest: { screens: { name: string; states: { name: string; route: string; fixtures: string; setup?: string[] }[] }[] };
  fixtures: Record<string, Record<string, unknown>>;
};

const issues: Issue[] = [
  {
    manifest: manifest0,
    fixtures: {
      "admin-home-approve": fixtures0_0,
      "admin-home-approve-address-changed": fixtures0_1,
      "admin-home-approve-duplicate": fixtures0_2,
      "admin-home-approve-name-taken": fixtures0_3,
      "admin-home-decline": fixtures0_4,
      "admin-home-no-longer-open": fixtures0_5,
      "admin-home-requests": fixtures0_6,
      "admin-learners-list": fixtures0_7,
      "admin-learners-search": fixtures0_8,
      "admin-lesson-draft-preview": fixtures0_9,
      "admin-lesson-edit": fixtures0_10,
      "admin-lesson-passage-invalid": fixtures0_11,
      "admin-lesson-video-failed": fixtures0_12,
      "admin-lesson-video-refused": fixtures0_13,
      "admin-lesson-video-uploading": fixtures0_14,
      "admin-module-delete-refused": fixtures0_15,
      "admin-module-edit": fixtures0_16,
      "admin-module-emptying-refused": fixtures0_17,
      "admin-module-question-invalid": fixtures0_18,
      "admin-program-empty": fixtures0_19,
      "admin-program-long": fixtures0_20,
      "admin-program-modules": fixtures0_21,
      "admin-program-publish-refused": fixtures0_22,
      "check-changed": fixtures0_23,
      "check-failed": fixtures0_24,
      "check-incomplete": fixtures0_25,
      "check-locked": fixtures0_26,
      "check-long": fixtures0_27,
      "check-open": fixtures0_28,
      "check-passed": fixtures0_29,
      "completion-already-in-program": fixtures0_30,
      "completion-approved": fixtures0_31,
      "completion-declined": fixtures0_32,
      "completion-leader": fixtures0_33,
      "completion-request-form": fixtures0_34,
      "completion-request-open": fixtures0_35,
      "completion-unverified": fixtures0_36,
      "gate-confirm-address": fixtures0_37,
      "gate-offer-new": fixtures0_38,
      "gate-offer-started": fixtures0_39,
      "gate-signed-out": fixtures0_40,
      "lesson-done": fixtures0_41,
      "lesson-locked": fixtures0_42,
      "lesson-long": fixtures0_43,
      "lesson-no-video": fixtures0_44,
      "lesson-unsafe-text": fixtures0_45,
      "lesson-video": fixtures0_46,
      "path-check-open": fixtures0_47,
      "path-completed-new-module": fixtures0_48,
      "path-continue": fixtures0_49,
      "path-leader": fixtures0_50,
      "path-long": fixtures0_51,
      "path-new-lesson-ahead": fixtures0_52,
      "path-new-module-ahead": fixtures0_53,
      "start-intro": fixtures0_54,
      "start-not-open": fixtures0_55,
    },
  },
];

export default issues;
