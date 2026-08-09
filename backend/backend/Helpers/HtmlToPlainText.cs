namespace backend.Helpers;

using System.Text;
using AngleSharp.Dom;

/// <summary>
/// Converts an AngleSharp HTML element subtree into formatted plain text,
/// preserving paragraph breaks, list items, and basic structure.
/// </summary>
public static class HtmlToPlainText
{
    public static string Convert(IElement? element)
    {
        if (element is null) return string.Empty;

        var sb = new StringBuilder();
        WalkNode(element, sb);

        var text = System.Net.WebUtility.HtmlDecode(sb.ToString().Trim());

        // Collapse 3+ newlines into a single blank line (2 newlines)
        text = System.Text.RegularExpressions.Regex.Replace(text, @"\n{3,}", "\n\n");

        //  trim trailing whitespace on each line
        text = string.Join('\n', text.Split('\n').Select(l => l.TrimEnd()));

        return text;
    }

    private static void WalkNode(INode node, StringBuilder sb)
    {
        foreach (var child in node.ChildNodes)
        {
            switch (child)
            {
                case IText text:
                    sb.Append(text.Text);
                    break;

                case IElement element:
                    var tag = element.TagName.ToUpperInvariant();

                    if (IsInline(tag))
                    {
                        WalkNode(element, sb);
                        break;
                    }

                    if (tag == "BR")
                    {
                        sb.AppendLine();
                        break;
                    }

                    // Any block element (including lists and horizontal rules)
                    if (IsBlock(tag) || tag is "UL" or "OL" or "LI" or "HR")
                    {
                        // Insert spacing before the block
                        StartBlock(sb);

                        if (tag is "UL" or "OL")
                            AppendListItems(element, sb, tag == "UL");
                        else if (tag == "LI")
                        {
                            sb.Append("• ");
                            WalkNode(element, sb);
                        }
                        else if (tag == "HR")
                            sb.Append("---");
                        else
                            WalkNode(element, sb);

                        // End the block: remove any trailing newlines and append exactly one
                        EndBlock(sb);
                        break;
                    }

                    // Unknown elements – just descend into their children
                    WalkNode(element, sb);
                    break;
            }
        }
    }

    private static bool IsInline(string tag) => tag switch
    {
        "A" or "SPAN" or "STRONG" or "EM" or "B" or "I" or "U" or "CODE"
            or "SUB" or "SUP" or "ABBR" or "MARK" or "SMALL" or "INS" or "DEL" => true,
        _ => false
    };

    private static bool IsBlock(string tag) => tag switch
    {
        "P" or "DIV" or "SECTION" or "ARTICLE"
            or "H1" or "H2" or "H3" or "H4" or "H5" or "H6"
            or "BLOCKQUOTE" or "PRE" => true,
        _ => false
    };

    private static void StartBlock(StringBuilder sb)
    {
        // Only add spacing if there is already content in the buffer
        if (sb.Length == 0)
            return;

        // End the current line if we aren't already at the start of one
        if (sb[^1] != '\n')
            sb.AppendLine();

        // Insert a single blank line before the new block
        sb.AppendLine();
    }

    private static void EndBlock(StringBuilder sb)
    {
        // Remove any trailing newlines (from nested content)
        while (sb.Length > 0 && sb[^1] == '\n')
            sb.Length--;

        // End the block with exactly one newline
        sb.AppendLine();
    }

    private static void AppendListItems(IElement listElement, StringBuilder sb, bool unordered)
    {
        int counter = 1;
        foreach (var li in listElement.QuerySelectorAll(":scope > li"))
        {
            // Ensure the bullet/number starts on its own line
            if (sb.Length > 0 && sb[^1] != '\n')
                sb.AppendLine();

            sb.Append(unordered ? "• " : $"{counter}. ");
            WalkNode(li, sb);
            sb.AppendLine();

            if (!unordered) counter++;
        }
    }
}