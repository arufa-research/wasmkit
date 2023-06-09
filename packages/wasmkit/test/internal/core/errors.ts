/* eslint-disable */
import { assert } from "chai";

import {
  WasmkitError, WasmKitPluginError
} from "../../../src/internal/core/errors";
import {
  ERROR_RANGES,
  ErrorDescriptor,
  ERRORS
} from "../../../src/internal/core/errors-list";
import { unsafeObjectKeys } from "../../../src/internal/util/unsafe";

const mockErrorDescriptor: ErrorDescriptor = {
  number: 123,
  message: "error message",
  title: "Mock error",
  description: "This is a mock error",
  shouldBeReported: false
};

describe("WasmkitError", () => {
  describe("Type guard", () => {
    it("Should return true for WasmkitErrors", () => {
      assert.isTrue(
        WasmkitError.isWasmkitError(new WasmkitError(mockErrorDescriptor))
      );
    });

    it("Should return false for everything else", () => {
      assert.isFalse(WasmkitError.isWasmkitError(new Error()));
      assert.isFalse(
        WasmkitError.isWasmkitError(new WasmKitPluginError("asd", "asd"))
      );
      assert.isFalse(WasmkitError.isWasmkitError(undefined));
      assert.isFalse(WasmkitError.isWasmkitError(null));
      assert.isFalse(WasmkitError.isWasmkitError(123));
      assert.isFalse(WasmkitError.isWasmkitError("123"));
      assert.isFalse(WasmkitError.isWasmkitError({ asd: 123 }));
    });
  });

  describe("Without parent error", () => {
    it("should have the right error number", () => {
      const error = new WasmkitError(mockErrorDescriptor);
      assert.equal(error.number, mockErrorDescriptor.number);
    });

    it("should format the error code to 4 digits", () => {
      const error = new WasmkitError(mockErrorDescriptor);
      assert.equal(error.message.substr(0, 10), "PE123: err");

      assert.equal(
        new WasmkitError({
          number: 1,
          message: "",
          title: "Title",
          description: "Description",
          shouldBeReported: false
        }).message.substr(0, 8),
        "PE1: "
      );
    });

    it("should have the right error message", () => {
      const error = new WasmkitError(mockErrorDescriptor);
      assert.equal(error.message, `PE123: ${mockErrorDescriptor.message}`);
    });

    it("should format the error message with the template params", () => {
      const error = new WasmkitError(
        {
          number: 12,
          message: "%a% %b% %c%",
          title: "Title",
          description: "Description",
          shouldBeReported: false
        },
        { a: "a", b: "b", c: 123 }
      );
      assert.equal(error.message, "PE12: a b 123");
    });

    it("shouldn't have a parent", () => {
      assert.isUndefined(new WasmkitError(mockErrorDescriptor).parent);
    });

    it("Should work with instanceof", () => {
      const error = new WasmkitError(mockErrorDescriptor);
      assert.instanceOf(error, WasmkitError);
    });
  });

  describe("With parent error", () => {
    it("should have the right parent error", () => {
      const parent = new Error();
      const error = new WasmkitError(mockErrorDescriptor, {}, parent);
      assert.equal(error.parent, parent);
    });

    it("should format the error message with the template params", () => {
      const error = new WasmkitError(
        {
          number: 12,
          message: "%a% %b% %c%",
          title: "Title",
          description: "Description",
          shouldBeReported: false
        },
        { a: "a", b: "b", c: 123 },
        new Error()
      );
      assert.equal(error.message, "PE12: a b 123");
    });

    it("Should work with instanceof", () => {
      const parent = new Error();
      const error = new WasmkitError(mockErrorDescriptor, {}, parent);
      assert.instanceOf(error, WasmkitError);
    });
  });
});

describe("Error ranges", () => {
  function inRange (n: number, min: number, max: number): boolean {
    return n >= min && n <= max;
  }

  it("Should have max > min", () => {
    for (const errorGroup of unsafeObjectKeys(ERROR_RANGES)) {
      const range = ERROR_RANGES[errorGroup];
      assert.isBelow(range.min, range.max, `Range of ${errorGroup} is invalid`);
    }
  });

  it("Shouldn't overlap ranges", () => {
    for (const errorGroup of unsafeObjectKeys(ERROR_RANGES)) {
      const range = ERROR_RANGES[errorGroup];

      for (const errorGroup2 of unsafeObjectKeys(ERROR_RANGES)) {
        const range2 = ERROR_RANGES[errorGroup2];

        if (errorGroup === errorGroup2) {
          continue;
        }

        assert.isFalse(
          inRange(range2.min, range.min, range.max),
          `Ranges of ${errorGroup} and ${errorGroup2} overlap`
        );

        assert.isFalse(
          inRange(range2.max, range.min, range.max),
          `Ranges of ${errorGroup} and ${errorGroup2} overlap`
        );
      }
    }
  });
});

describe("Error descriptors", () => {
  it("Should have all errors inside their ranges", () => {
    for (const errorGroup of unsafeObjectKeys(ERRORS)) {
      const range = ERROR_RANGES[errorGroup];

      for (const [name, errorDescriptor] of Object.entries<ErrorDescriptor>(
        ERRORS[errorGroup]
      )) {
        assert.isAtLeast(
          errorDescriptor.number,
          range.min,
          `ERRORS.${errorGroup}.${name}'s number is out of range`
        );
        assert.isAtMost(
          errorDescriptor.number,
          range.max - 1,
          `ERRORS.${errorGroup}.${name}'s number is out of range`
        );
      }
    }
  });

  it("Shouldn't repeat error numbers", () => {
    for (const errorGroup of unsafeObjectKeys(ERRORS)) {
      for (const [name, errorDescriptor] of Object.entries<ErrorDescriptor>(
        ERRORS[errorGroup]
      )) {
        for (const [name2, errorDescriptor2] of Object.entries<ErrorDescriptor>(
          ERRORS[errorGroup]
        )) {
          if (name !== name2) {
            assert.notEqual(
              errorDescriptor.number,
              errorDescriptor2.number,
              `ERRORS.${errorGroup}.${name} and ${errorGroup}.${name2} have repeated numbers`
            );
          }
        }
      }
    }
  });
});

describe("WasmKitPluginError", () => {
  describe("Type guard", () => {
    it("Should return true for WasmKitPluginError", () => {
      assert.isTrue(
        WasmKitPluginError.isWasmKitPluginError(
          new WasmKitPluginError("asd", "asd")
        )
      );
    });

    it("Should return false for everything else", () => {
      assert.isFalse(WasmKitPluginError.isWasmKitPluginError(new Error()));
      assert.isFalse(
        WasmKitPluginError.isWasmKitPluginError(
          new WasmkitError(ERRORS.GENERAL.NOT_INSIDE_PROJECT)
        )
      );
      assert.isFalse(WasmKitPluginError.isWasmKitPluginError(undefined));
      assert.isFalse(WasmKitPluginError.isWasmKitPluginError(null));
      assert.isFalse(WasmKitPluginError.isWasmKitPluginError(123));
      assert.isFalse(WasmKitPluginError.isWasmKitPluginError("123"));
      assert.isFalse(WasmKitPluginError.isWasmKitPluginError({ asd: 123 }));
    });
  });

  describe("constructors", () => {
    describe("automatic plugin name", () => {
      it("Should accept a parent error", () => {
        const message = "m";
        const parent = new Error();

        const error = new WasmKitPluginError(message, parent);

        assert.equal(error.message, message);
        assert.equal(error.parent, parent);
      });

      it("Should work without a parent error", () => {
        const message = "m2";

        const error = new WasmKitPluginError(message);

        assert.equal(error.message, message);
        assert.isUndefined(error.parent);
      });

      it("Should autodetect the plugin name", () => {
        const message = "m";
        const parent = new Error();

        const error = new WasmKitPluginError(message, parent);

        // This is being called from mocha, so that would be used as plugin name
        assert.equal(error.pluginName, "mocha");
      });

      it("Should work with instanceof", () => {
        const message = "m";
        const parent = new Error();

        const error = new WasmKitPluginError(message, parent);

        assert.instanceOf(error, WasmKitPluginError);
      });
    });

    describe("explicit plugin name", () => {
      it("Should accept a parent error", () => {
        const plugin = "p";
        const message = "m";
        const parent = new Error();

        const error = new WasmKitPluginError(plugin, message, parent);

        assert.equal(error.pluginName, plugin);
        assert.equal(error.message, message);
        assert.equal(error.parent, parent);
      });

      it("Should work without a parent error", () => {
        const plugin = "p2";
        const message = "m2";

        const error = new WasmKitPluginError(plugin, message);

        assert.equal(error.pluginName, plugin);
        assert.equal(error.message, message);
        assert.isUndefined(error.parent);
      });

      it("Should work with instanceof", () => {
        const plugin = "p";
        const message = "m";
        const parent = new Error();

        const error = new WasmKitPluginError(plugin, message, parent);

        assert.instanceOf(error, WasmKitPluginError);
      });
    });
  });
});

// describe("applyErrorMessageTemplate", () => {
//  describe("Variable names", () => {
//    it("Should reject invalid variable names", () => {
//      expectWasmkitError(
//        () => applyErrorMessageTemplate("", { "1": 1 }),
//        ERRORS.INTERNAL.TEMPLATE_INVALID_VARIABLE_NAME
//      );
//
//      expectWasmkitError(
//        () => applyErrorMessageTemplate("", { "asd%": 1 }),
//        ERRORS.INTERNAL.TEMPLATE_INVALID_VARIABLE_NAME
//      );
//
//      expectWasmkitError(
//        () => applyErrorMessageTemplate("", { "asd asd": 1 }),
//        ERRORS.INTERNAL.TEMPLATE_INVALID_VARIABLE_NAME
//      );
//    });
//  });
//
//  describe("Values", () => {
//    it("shouldn't contain valid variable tags", () => {
//      expectWasmkitError(
//        () => applyErrorMessageTemplate("%asd%", { asd: "%as%" }),
//        ERRORS.INTERNAL.TEMPLATE_VALUE_CONTAINS_VARIABLE_TAG
//      );
//
//      expectWasmkitError(
//        () => applyErrorMessageTemplate("%asd%", { asd: "%a123%" }),
//        ERRORS.INTERNAL.TEMPLATE_VALUE_CONTAINS_VARIABLE_TAG
//      );
//
//      expectWasmkitError(
//        () =>
//          applyErrorMessageTemplate("%asd%", {
//            asd: { toString: () => "%asd%" },
//          }),
//        ERRORS.INTERNAL.TEMPLATE_VALUE_CONTAINS_VARIABLE_TAG
//      );
//    });
//
//    it("Shouldn't contain the %% tag", () => {
//      expectWasmkitError(
//        () => applyErrorMessageTemplate("%asd%", { asd: "%%" }),
//        ERRORS.INTERNAL.TEMPLATE_VALUE_CONTAINS_VARIABLE_TAG
//      );
//    });
//  });
//
//  describe("Replacements", () => {
//    describe("String values", () => {
//      it("Should replace variable tags for the values", () => {
//        assert.equal(
//          applyErrorMessageTemplate("asd %asd% 123 %asd%", { asd: "r" }),
//          "asd r 123 r"
//        );
//
//        assert.equal(
//          applyErrorMessageTemplate("asd%asd% %asd% %fgh% 123", {
//            asd: "r",
//            fgh: "b",
//          }),
//          "asdr r b 123"
//        );
//
//        assert.equal(
//          applyErrorMessageTemplate("asd%asd% %asd% %fgh% 123", {
//            asd: "r",
//            fgh: "",
//          }),
//          "asdr r  123"
//        );
//      });
//    });
//
//    describe("Non-string values", () => {
//      it("Should replace undefined values for undefined", () => {
//        assert.equal(
//          applyErrorMessageTemplate("asd %asd% 123 %asd%", { asd: undefined }),
//          "asd undefined 123 undefined"
//        );
//      });
//
//      it("Should replace null values for null", () => {
//        assert.equal(
//          applyErrorMessageTemplate("asd %asd% 123 %asd%", { asd: null }),
//          "asd null 123 null"
//        );
//      });
//
//      it("Should use their toString methods", () => {
//        const toR = { toString: () => "r" };
//        const toB = { toString: () => "b" };
//        const toEmpty = { toString: () => "" };
//        const toUndefined = { toString: () => undefined };
//
//        assert.equal(
//          applyErrorMessageTemplate("asd %asd% 123 %asd%", { asd: toR }),
//          "asd r 123 r"
//        );
//
//        assert.equal(
//          applyErrorMessageTemplate("asd%asd% %asd% %fgh% 123", {
//            asd: toR,
//            fgh: toB,
//          }),
//          "asdr r b 123"
//        );
//
//        assert.equal(
//          applyErrorMessageTemplate("asd%asd% %asd% %fgh% 123", {
//            asd: toR,
//            fgh: toEmpty,
//          }),
//          "asdr r  123"
//        );
//
//        assert.equal(
//          applyErrorMessageTemplate("asd%asd% %asd% %fgh% 123", {
//            asd: toR,
//            fgh: toUndefined,
//          }),
//          "asdr r undefined 123"
//        );
//      });
//    });
//
//    describe("%% sign", () => {
//      it("Should be replaced with %", () => {
//        assert.equal(applyErrorMessageTemplate("asd%%asd", {}), "asd%asd");
//      });
//        assert.equal(
//          applyErrorMessageTemplate("asd%%asd%% %asd%", { asd: "123" }),
//          "asd%asd% 123"
//        );
//      });
//    });
//
//    describe("Missing variable tag", () => {
//      it("Should fail if a viable tag is missing and its value is not", () => {
//        expectWasmkitError(
//          () => applyErrorMessageTemplate("", { asd: "123" }),
//          ERRORS.INTERNAL.TEMPLATE_VARIABLE_TAG_MISSING
//        );
//      });
//    });
//
//    describe("Missing variable", () => {
//      it("Should work, leaving the variable tag", () => {
//        assert.equal(
//          applyErrorMessageTemplate("%asd% %fgh%", { asd: "123" }),
//          "123 %fgh%"
//        );
//      });
//    });
//  });
// });
