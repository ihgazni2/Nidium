/**
 * Copyright 2017 Nidium Inc. All rights reserved.
 * Use of this source code is governed by a MIT license
 * that can be found in the LICENSE file.
 */

{
    const Elements = require("Elements");

    const s_NodeText = Symbol("NodeText");
    const { StyleContainer, ElementStyle } = require("ElementsStyles");

    Elements.textnode = class extends Elements.Element {
        constructor(textValue) {
            super();
            this.nodeValue = textValue;
            this._textData = null;
        }

        cloneNode(deep = true, shadowRoot=this[s_ShadowRoot]) {
            return Elements.Create(this.name(), this.nodeValue, shadowRoot);
        }

        getNMLContent() {
            return this.nodeValue;
        }

        computeSelfSize() {
            setTimeout(() => {
                let {width, height} = this.getDimensions(true);
                /* Use document context as we don't have a self context yet */
                var ctx = document.canvas.getContext("2d");
                let fontSize    = this.style.fontSize || 15;
                let lineHeight  = this.style.lineHeight || 20;

                ctx.save();
                    ctx.fontSize     = fontSize;
                    ctx.textBaseline = "middle";
                    this._textData   = ctx.breakText(this.nodeValue, width);
                    this.height      = lineHeight * this._textData.lines.length;
                ctx.restore();

            }, 1);
        }

        set textContent(value) {
            this.nodeValue = value;
        }

        allowsChild() {
            return false;
        }

        get nodeValue() {
            return this[s_NodeText];
        }

        set nodeValue(textValue) {
            if (textValue == this.nodeValue) return this;
            this[s_NodeText] = textValue.trim();
            this.computeSelfSize();
            this.requestPaint();
            this.fireEvent("nodeValueChanged", textValue);
        }

        get nodeType() {
            return Elements.NodeType.TEXT_NODE;
        }

        paint(ctx, width, height) {
            super.paint(ctx, width, height);

            if (!this.nodeValue || !this._textData) return false;

            let actualWidth = 1;

            let fontSize    = this.style.fontSize || 15;
            let lineHeight  = this.style.lineHeight || 20;
            let color       = this.style.color || "#000000";

            let offset      = Math.ceil(lineHeight/2);

            ctx.fontSize        = fontSize;
            ctx.fillStyle       = color;
            ctx.textBaseline    = "middle";

            var ox = 0;

            let data = this._textData;

            for (var i = 0; i<data.lines.length; i++) {
                let w = ctx.measureText(data.lines[i]).width;

                if (w > actualWidth) actualWidth = w;

                if (this.style.textAlign == "center") {
                    ox = (width-w)*0.5;
                }
                if (this.style.textAlign == "right") {
                    ox = (width-w);
                }

                ctx.fillText(data.lines[i], ox, i*lineHeight + offset);
            }
        }
    }

    ElementStyle.Inherit(Elements.textnode);
}
