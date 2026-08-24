import { writeFile } from "node:fs/promises";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BackpackIcon, HomeIcon, PersonIcon, VideoIcon } from "@radix-ui/react-icons";

const outputDir = "/Users/shushan/Downloads/codex仓库/予/yu-tea-miniprogram/assets/icons";
const icons = {
  home: HomeIcon,
  shop: BackpackIcon,
  community: VideoIcon,
  me: PersonIcon,
};

for (const [name, Icon] of Object.entries(icons)) {
  for (const [variant, color] of [["", "#929892"], ["-active", "#183b2d"]]) {
    const svg = renderToStaticMarkup(
      React.createElement(Icon, { width: 96, height: 96, color, "aria-hidden": true }),
    );
    await writeFile(`${outputDir}/${name}${variant}.svg`, svg);
  }
}
