import Link from "next/link";
import type { Report } from "../../../types/Moderation";
import Panel from "../../ui/Panel";
import PopperButton from "../../ui/PopperButton";

type Props = {
  report: Report;
};

const ReportItem = ({ report }: Props) => {
  return (
    <Panel>
      <div className="grid grid-cols-4">
        <div>
          <label>Reported On</label>
          <div>{report.createdAt.toLocaleString()}</div>
        </div>
        <div>
          <label>Reported By</label>
          <div>
            <Link
              target="_blank"
              className="transition-all hover:text-orange-500"
              href={`/${report.author.name}`}
            >
              {report.author.displayName}
            </Link>
          </div>
        </div>
        <div>
          <label>Item Reported</label>
          <div>
            {report.build && (
              <Link
                target="_blank"
                className="transition-all hover:text-orange-500"
                href={`/builds/${report.build.id}`}
              >
                Build
              </Link>
            )}
            {report.user && (
              <Link
                target="_blank"
                className="transition-all hover:text-orange-500"
                href={`/${report.user.name}`}
              >
                User
              </Link>
            )}
            {report.review && (
              <PopperButton
                showOn="hovermenu"
                button={
                  <Link
                    target="_blank"
                    className="transition-all hover:text-orange-500"
                    href={`/builds/${report.review.buildId}`}
                  >
                    Review
                  </Link>
                }
                tooltip={
                  <div>
                    <div>
                      <Link
                        target="_blank"
                        className="text-sm transition-all hover:text-orange-500"
                        href={`/${report.review.author.name}`}
                      >
                        {report.review.author.displayName}
                      </Link>
                    </div>
                    <div>{report.review.content}</div>
                  </div>
                }
              />
            )}
            {report.reply && (
              <PopperButton
                showOn="hovermenu"
                button={
                  <Link
                    target="_blank"
                    className="transition-all hover:text-orange-500"
                    href={`/builds/${report.reply.review.buildId}`}
                  >
                    Reply
                  </Link>
                }
                tooltip={
                  <div>
                    <div>
                      <Link
                        target="_blank"
                        className="text-sm transition-all hover:text-orange-500"
                        href={`/${report.reply.author.name}`}
                      >
                        {report.reply.author.displayName}
                      </Link>
                    </div>
                    <div>{report.reply.content}</div>
                  </div>
                }
              />
            )}
          </div>
        </div>
        <div>
          <label>Reason</label>
          <div>{report.notes ? report.notes : "N/A"}</div>
        </div>
      </div>
    </Panel>
  );
};

export default ReportItem;
