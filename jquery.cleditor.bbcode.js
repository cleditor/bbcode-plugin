/**
 @preserve CLEditor BBCode Plugin v1.0.0
 http://premiumsoftware.net/cleditor
 requires CLEditor v1.3.0 or later
 
 Copyright 2010, Chris Landowski, Premium Software, LLC
 Dual licensed under the MIT or GPL Version 2 licenses.
*/

// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS
// @output_file_name jquery.cleditor.bbcode.min.js
// ==/ClosureCompiler==

/*

  The CLEditor useCSS optional parameter should be set to false for this plugin
  to function properly.

  Supported HTML and BBCode Tags:

  Bold              <b>Hello</b>
                    [b]Hello[/b]
  Italics           <i>Hello</i>
                    [i]Hello[/i]
  Underlined        <u>Hello</u>
                    [u]Hello[/u]
  Strikethrough     <strike>Hello</strike>
                    [s]Hello[/s]
  Font              <font face="Impact">Hello</font>
                    [font=impact]Hello[/font]
  Color             <font color="#ff00ff">Hello</font>
                    [color=ff00ff]Hello[/color]
  Size              <font size="6">Hello</font>
                    [size=6]Hello[/size]
  Unordered Lists   <ul><li>Red</li><li>Blue</li><li>Green</li></ul>
                    [list][*]Red[/*][*]Green[/*][*]Blue[/*][/list]
  Ordered Lists     <ol><li>Red</li><li>Blue</li><li>Green</li></ol>
                    [list=1][*]Red[/*][*]Green[/*][*]Blue[/*][/list]
  Images            <img src="http://premiumsoftware.net/image.jpg">
                    [img]http://premiumsoftware.net/image.jpg[/img]
  Links             <a href="http://premiumsoftware.net">Premium Software</a>
                    [url=http://premiumsoftware.net]Premium Software[/url]

*/
/*
2011-07-09 Sam Clarke <sam@samcalrke.com>:
		Added color tag
		Added font tag
		Added size tag
		Changed so that <> will be converted to &lt;&gt; when going from source to WYSIWYG stopping HTML from being manually entered when in BBCode mode
		Fixed &nbsp; not being converted to a space in source view
		Fixed div tags sometimes not being removed in chrome when contents is multi-line
 */

(function($)
{
	// BBCode only supports a small subset of HTML, so remove
	// any toolbar buttons that are not currently supported.
	$.cleditor.defaultOptions.controls =
		"bold italic underline strikethrough removeformat | font color size | bullets numbering | " +
		//"undo redo | image link unlink | cut copy paste pastetext | print source";
"undo redo | image link unlink | print source";

	// Save the previously assigned callback handlers
	var oldAreaCallback = $.cleditor.defaultOptions.updateTextArea;
	var oldFrameCallback = $.cleditor.defaultOptions.updateFrame;

	// Wireup the updateTextArea callback handler
	$.cleditor.defaultOptions.updateTextArea = function(html)
	{
		// Fire the previously assigned callback handler
		if (oldAreaCallback)
			html = oldAreaCallback(html);

		// Convert the HTML to BBCode
		return $.cleditor.convertHTMLtoBBCode(html);

	}

	// Wireup the updateFrame callback handler
	$.cleditor.defaultOptions.updateFrame = function(code)
	{
		// Fire the previously assigned callback handler
		if (oldFrameCallback)
			code = oldFrameCallback(code);

		// Convert the BBCode to HTML
		return $.cleditor.convertBBCodeToHTML(code);
	}

	// Expose the convertHTMLtoBBCode method
	$.cleditor.convertHTMLtoBBCode = function(html)
	{
		$.each([
				[/<b>/gi, "[b]"],
				[/<\/b>/gi, "[/b]"],
				[/<strong>/gi, "[b]"],
				[/<\/strong>/gi, "[/b]"],
				[/<i>/gi, "[i]"],
				[/<\/i>/gi, "[/i]"],
				[/<em>/gi, "[i]"],
				[/<\/em>/gi, "[/i]"],
				[/<u>/gi, "[u]"],
				[/<\/u>/gi, "[/u]"],
				[/<ins>/gi, "[u]"],
				[/<\/ins>/gi, "[/u]"],
				[/<strike>/gi, "[s]"],
				[/<\/strike>/gi, "[/s]"],
				[/<del>/gi, "[s]"],
				[/<\/del>/gi, "[/s]"],
				[/<a[^>]*?href="([^"]*?)".*?>([\s\S]*?)<\/a>/gi, "[url=$1]$2[/url]"],
				[/<img[^>]*?src="([^"]*?)"[^>]*?>/gi, "[img]$1[/img]"],
				[/<ul>/gi, "[list]"],
				[/<\/ul>/gi, "[/list]"],
				[/<ol>/gi, "[list=1]"],
				[/<\/ol>/gi, "[/list]"],
				[/<li>/gi, "[*]"],
				[/<\/li>/gi, "[/*]"],

				// new font bbcodes. They are complicated and ugly but on the plus side they do handle nesting correctly! :)
				[/<font[^>]*?color="?([^">]*?)"?>((?:[\s\S](?!<font[^>]*?color))*?)<\/font>/gi, "[color=$1]$2[/color]"],
				[/<font[^>]*?size="?([^">]*?)"?>((?:[\s\S](?!<font[^>]*?size))*?)<\/font>/gi, "[size=$1]$2[/size]"],
				[/<font[^>]*?face="?'?([^'">]*?)'?"?>((?:[\s\S](?!<font[^>]*?face))*?)<\/font>/gi, "[font=$1]$2[/font]"],

				// line breaks
				[/[\r|\n]/g, ""],
				[/<\/p>/gi, "\n"],
				[/<div><br[^>]*?>/gi, ""],	// divs seem to alias paragraphs in chrome. When you create a blank line it fills
								// the divs with a br which causes duplicate line-breaks. One for the paragraph (div)
								// and one for the BR. To fix remove the br if all that is contained in it
				[/<\/div>/gi, "\n"], // divs seem to paragraphs in chrome so treat them like it
				[/<br[^>]*?>/gi, "\n"],

				//remove any leftover html
				[/<[^>]*?>/g, ""],

				// HTML elements
				[/&nbsp;|\u00a0/gi, " "],
				[/&amp;/gi, "&"],
				[/&lt;/gi, "<"],
				[/&gt;/gi, ">"],
				[/&quot;/gi, "\""]
			],
			function(index, item)
			{
				// Keep running the replace untill all matches are
				// replaced. Needed for the nested bbcodes.
				var oldHtml=html;

				while((html = html.replace(item[0],item[1])) != oldHtml)
					oldHtml=html;
			});

		return html;
	}

	// Expose the convertBBCodeToHTML method
	$.cleditor.convertBBCodeToHTML = function(code)
	{
		$.each([
			[/&/g, "&amp;"],
			[/</g, "&lt;"],
			[/>/g, "&gt;"],
			[/\r/g, ""],
			[/\n/g, "<br />"],

			[/\[color=([^\]]*?)\]/gi, "<font color=\"$1\">"],
			[/\[\/color\]/gi, "</font>"],
			[/\[size=([^\]]*?)\]/gi, "<font size=\"$1\">"],
			[/\[\/size\]/gi, "</font>"],
			[/\[font=([^\]]*?)\]/gi, "<font face=\"$1\">"],
			[/\[\/font\]/gi, "</font>"],

			[/\[b\]/gi, "<strong>"],
			[/\[\/b\]/gi, "</strong>"],
			[/\[i\]/gi, "<em>"],
			[/\[\/i\]/gi, "</em>"],
			[/\[u\]/gi, "<u>"],
			[/\[\/u\]/gi, "</u>"],
			[/\[s\]/gi, "<strike>"],
			[/\[\/s\]/gi, "</strike>"],

			[/\[url=(.*?)\](.*?)\[\/url\]/gi, "<a href=\"$1\">$2</a>"],
			[/\[url\](.*?)\[\/url\]/gi, "<a href=\"$1\">$1</a>"],
			[/\[img\](.*?)\[\/img\]/gi, "<img src=\"$1\">"],
			[/\[list\](.*?)\[\/list\]/gi, "<ul>$1</ul>"],
			[/\[list=1\](.*?)\[\/list\]/gi, "<ol>$1</ol>"],
			[/\[list\]/gi, "<ul>"],
			[/\[list=1\]/gi, "<ol>"],
			[/\[\*\](.*?)\[\/\*\]/g, "<li>$1</li>"],
			[/\[\*\]/g, "<li>"],

			// replace all double spaces not inside HTML
			[/  (?=([^\<\>]*?<|[^\<\>]*?$))/g, "&nbsp;&nbsp;"]
		], 
		function(index, item)
		{
			code = code.replace(item[0], item[1]);
		});

		return code;
	}
})(jQuery);
